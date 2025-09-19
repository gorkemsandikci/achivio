;; NFT Badges Contract - Achievement Badges for Achivio Habit Tracker
;; This contract manages NFT badges awarded for milestone achievements and 100% task completion

;; Import NFT trait (using a standard NFT trait)
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Error constants
(define-constant ERR_OWNER_ONLY (err u400))
(define-constant ERR_NOT_TOKEN_OWNER (err u401))
(define-constant ERR_TOKEN_NOT_FOUND (err u402))
(define-constant ERR_UNAUTHORIZED (err u403))
(define-constant ERR_CONTRACT_PAUSED (err u404))
(define-constant ERR_INVALID_USER (err u405))
(define-constant ERR_BADGE_ALREADY_MINTED (err u406))
(define-constant ERR_INSUFFICIENT_ACHIEVEMENT (err u407))
(define-constant ERR_INVALID_BADGE_TYPE (err u408))
(define-constant ERR_METADATA_FROZEN (err u409))

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant CONTRACT_NAME "Achivio Achievement Badges")
(define-constant BASE_TOKEN_URI "https://achivio.app/badges/")

;; Badge types
(define-constant BADGE_TYPE_STREAK u1)
(define-constant BADGE_TYPE_TASK_MASTER u2)
(define-constant BADGE_TYPE_CATEGORY_EXPERT u3)
(define-constant BADGE_TYPE_LEVEL_UP u4)
(define-constant BADGE_TYPE_SPECIAL_EVENT u5)

;; Define the NFT
(define-non-fungible-token achievement-badge uint)

;; Contract state
(define-data-var contract-paused bool false)
(define-data-var last-token-id uint u0)
(define-data-var total-badges-minted uint u0)
(define-data-var metadata-frozen bool false)

;; Authorized minters (other contracts that can mint badges)
(define-map authorized-minters principal bool)

;; Badge metadata structure
(define-map badge-metadata
  uint ;; token-id
  {
    badge-type: uint,
    title: (string-ascii 100),
    description: (string-ascii 500),
    image-uri: (string-ascii 200),
    achievement-data: {
      milestone: uint,
      earned-at: uint,
      category: (string-ascii 50),
      special-attributes: (string-ascii 200)
    },
    rarity: (string-ascii 20) ;; Common, Rare, Epic, Legendary
  }
)

;; User badge collections
(define-map user-badges
  principal
  {
    total-badges: uint,
    badge-ids: (list 100 uint),
    achievements-unlocked: (list 50 uint),
    rarity-counts: {
      common: uint,
      rare: uint,
      epic: uint,
      legendary: uint
    }
  }
)

;; Badge type definitions
(define-map badge-types
  uint
  {
    name: (string-ascii 50),
    description: (string-ascii 200),
    base-image-uri: (string-ascii 200),
    is-active: bool,
    total-minted: uint
  }
)

;; Initialize badge types
(map-set badge-types BADGE_TYPE_STREAK 
  {
    name: "Streak Master",
    description: "Awarded for consecutive day achievements",
    base-image-uri: "streak/",
    is-active: true,
    total-minted: u0
  }
)

(map-set badge-types BADGE_TYPE_TASK_MASTER 
  {
    name: "Task Master",
    description: "Awarded for completing high numbers of tasks",
    base-image-uri: "taskmaster/",
    is-active: true,
    total-minted: u0
  }
)

(map-set badge-types BADGE_TYPE_CATEGORY_EXPERT 
  {
    name: "Category Expert",
    description: "Awarded for mastery in specific habit categories",
    base-image-uri: "category/",
    is-active: true,
    total-minted: u0
  }
)

(map-set badge-types BADGE_TYPE_LEVEL_UP 
  {
    name: "Level Champion",
    description: "Awarded for reaching new user levels",
    base-image-uri: "level/",
    is-active: true,
    total-minted: u0
  }
)

(map-set badge-types BADGE_TYPE_SPECIAL_EVENT 
  {
    name: "Special Event",
    description: "Limited edition badges for special occasions",
    base-image-uri: "special/",
    is-active: true,
    total-minted: u0
  }
)

;; Initialize contract owner as authorized minter
(map-set authorized-minters CONTRACT_OWNER true)

;; Admin functions

;; Add authorized minter
(define-public (add-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (map-set authorized-minters minter true))
  )
)

;; Remove authorized minter
(define-public (remove-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (map-delete authorized-minters minter))
  )
)

;; Pause/unpause contract
(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set contract-paused true))
  )
)

(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set contract-paused false))
  )
)

;; Freeze metadata (irreversible)
(define-public (freeze-metadata)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set metadata-frozen true))
  )
)

;; NFT Trait Implementation

;; Get last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; Get token URI
(define-read-only (get-token-uri (token-id uint))
  (match (map-get? badge-metadata token-id)
    metadata (ok (some (get image-uri metadata)))
    (ok none)
  )
)

;; Get token owner
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? achievement-badge token-id))
)

;; Transfer function
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (asserts! (is-some (nft-get-owner? achievement-badge token-id)) ERR_TOKEN_NOT_FOUND)
    
    ;; Update user badge collections
    (try! (update-user-badge-collection-on-transfer sender recipient token-id))
    
    ;; Perform transfer
    (nft-transfer? achievement-badge token-id sender recipient)
  )
)

;; Badge minting functions

;; Mint achievement badge (called by authorized contracts)
(define-public (mint-achievement-badge
    (recipient principal)
    (badge-type uint)
    (title (string-ascii 100))
    (description (string-ascii 500))
    (milestone uint)
    (category (string-ascii 50))
    (rarity (string-ascii 20))
  )
  (let 
    (
      (new-token-id (+ (var-get last-token-id) u1))
      (badge-type-data (unwrap! (map-get? badge-types badge-type) ERR_INVALID_BADGE_TYPE))
      (image-uri (concat BASE_TOKEN_URI (concat (get base-image-uri badge-type-data) (uint-to-ascii new-token-id))))
    )
    (begin
      ;; Security checks
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (default-to false (map-get? authorized-minters tx-sender)) ERR_UNAUTHORIZED)
      (asserts! (is-standard recipient) ERR_INVALID_USER)
      (asserts! (get is-active badge-type-data) ERR_INVALID_BADGE_TYPE)
      
      ;; Mint the NFT
      (try! (nft-mint? achievement-badge new-token-id recipient))
      
      ;; Set badge metadata
      (map-set badge-metadata new-token-id
        {
          badge-type: badge-type,
          title: title,
          description: description,
          image-uri: image-uri,
          achievement-data: {
            milestone: milestone,
            earned-at: block-height,
            category: category,
            special-attributes: ""
          },
          rarity: rarity
        }
      )
      
      ;; Update badge type statistics
      (map-set badge-types badge-type
        (merge badge-type-data {
          total-minted: (+ (get total-minted badge-type-data) u1)
        })
      )
      
      ;; Update user badge collection
      (try! (update-user-badge-collection recipient new-token-id rarity))
      
      ;; Update contract state
      (var-set last-token-id new-token-id)
      (var-set total-badges-minted (+ (var-get total-badges-minted) u1))
      
      ;; Log minting event
      (print {
        action: "badge-minted",
        token-id: new-token-id,
        recipient: recipient,
        badge-type: badge-type,
        title: title,
        rarity: rarity,
        milestone: milestone
      })
      
      (ok new-token-id)
    )
  )
)

;; Mint streak milestone badge
(define-public (mint-streak-badge (recipient principal) (streak-days uint))
  (let 
    (
      (title (concat "Streak Champion - " (uint-to-ascii streak-days)))
      (description (concat "Achieved " (concat (uint-to-ascii streak-days) " consecutive days of habit completion!")))
      (rarity (get-streak-rarity streak-days))
    )
    (mint-achievement-badge 
      recipient 
      BADGE_TYPE_STREAK 
      title 
      description 
      streak-days 
      "streak" 
      rarity
    )
  )
)

;; Mint task master badge
(define-public (mint-task-master-badge (recipient principal) (tasks-completed uint))
  (let 
    (
      (title (concat "Task Master - " (uint-to-ascii tasks-completed)))
      (description (concat "Completed " (concat (uint-to-ascii tasks-completed) " total tasks!")))
      (rarity (get-task-master-rarity tasks-completed))
    )
    (mint-achievement-badge 
      recipient 
      BADGE_TYPE_TASK_MASTER 
      title 
      description 
      tasks-completed 
      "tasks" 
      rarity
    )
  )
)

;; Helper functions

;; Determine streak badge rarity
(define-read-only (get-streak-rarity (streak-days uint))
  (if (>= streak-days u365) "legendary"
    (if (>= streak-days u100) "epic"
      (if (>= streak-days u30) "rare"
        "common"
      )
    )
  )
)

;; Determine task master badge rarity
(define-read-only (get-task-master-rarity (tasks-completed uint))
  (if (>= tasks-completed u1000) "legendary"
    (if (>= tasks-completed u250) "epic"
      (if (>= tasks-completed u50) "rare"
        "common"
      )
    )
  )
)

;; Update user badge collection
(define-private (update-user-badge-collection (user principal) (token-id uint) (rarity (string-ascii 20)))
  (let 
    (
      (user-data (default-to
        {
          total-badges: u0,
          badge-ids: (list),
          achievements-unlocked: (list),
          rarity-counts: { common: u0, rare: u0, epic: u0, legendary: u0 }
        }
        (map-get? user-badges user)
      ))
      (current-rarity-counts (get rarity-counts user-data))
    )
    (begin
      (map-set user-badges user
        {
          total-badges: (+ (get total-badges user-data) u1),
          badge-ids: (unwrap-panic (as-max-len? (append (get badge-ids user-data) token-id) u100)),
          achievements-unlocked: (get achievements-unlocked user-data),
          rarity-counts: (if (is-eq rarity "legendary")
                          (merge current-rarity-counts { legendary: (+ (get legendary current-rarity-counts) u1) })
                          (if (is-eq rarity "epic")
                            (merge current-rarity-counts { epic: (+ (get epic current-rarity-counts) u1) })
                            (if (is-eq rarity "rare")
                              (merge current-rarity-counts { rare: (+ (get rare current-rarity-counts) u1) })
                              (merge current-rarity-counts { common: (+ (get common current-rarity-counts) u1) })
                            )
                          )
                        )
        }
      )
      (ok true)
    )
  )
)

;; Update user badge collection on transfer
(define-private (update-user-badge-collection-on-transfer (sender principal) (recipient principal) (token-id uint))
  (let ((badge-metadata-data (unwrap! (map-get? badge-metadata token-id) ERR_TOKEN_NOT_FOUND)))
    (begin
      ;; Remove from sender's collection (simplified - would need proper list removal)
      ;; Add to recipient's collection
      (update-user-badge-collection recipient token-id (get rarity badge-metadata-data))
    )
  )
)

;; Read-only functions

;; Get badge metadata
(define-read-only (get-badge-metadata (token-id uint))
  (map-get? badge-metadata token-id)
)

;; Get user's badge collection
(define-read-only (get-user-badge-collection (user principal))
  (map-get? user-badges user)
)

;; Get badge type information
(define-read-only (get-badge-type-info (badge-type uint))
  (map-get? badge-types badge-type)
)

;; Check if user owns specific badge type
(define-read-only (user-owns-badge-type (user principal) (badge-type uint))
  (match (map-get? user-badges user)
    user-data
      ;; In a full implementation, would iterate through badge-ids and check types
      ;; For now, return simplified result
      (> (get total-badges user-data) u0)
    false
  )
)

;; Get contract statistics
(define-read-only (get-contract-stats)
  {
    total-badges-minted: (var-get total-badges-minted),
    last-token-id: (var-get last-token-id),
    contract-paused: (var-get contract-paused),
    metadata-frozen: (var-get metadata-frozen)
  }
)

;; Check if user is authorized minter
(define-read-only (is-authorized-minter (minter principal))
  (default-to false (map-get? authorized-minters minter))
)

;; Utility function to convert uint to ascii (simplified)
(define-read-only (uint-to-ascii (num uint))
  ;; This is a simplified version - a full implementation would handle all numbers
  (if (is-eq num u1) "1"
    (if (is-eq num u7) "7"
      (if (is-eq num u14) "14"
        (if (is-eq num u30) "30"
          (if (is-eq num u100) "100"
            (if (is-eq num u365) "365"
              "unknown"
            )
          )
        )
      )
    )
  )
)
