;; Room Items Contract - 3D Virtual Workspace Customization for Achivio
;; This contract manages virtual items that users can buy and place in their 3D rooms

;; Import NFT trait for room items
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Error constants
(define-constant ERR_OWNER_ONLY (err u500))
(define-constant ERR_NOT_TOKEN_OWNER (err u501))
(define-constant ERR_TOKEN_NOT_FOUND (err u502))
(define-constant ERR_UNAUTHORIZED (err u503))
(define-constant ERR_CONTRACT_PAUSED (err u504))
(define-constant ERR_INVALID_USER (err u505))
(define-constant ERR_INSUFFICIENT_FUNDS (err u506))
(define-constant ERR_ITEM_NOT_AVAILABLE (err u507))
(define-constant ERR_INVALID_POSITION (err u508))
(define-constant ERR_ROOM_FULL (err u509))
(define-constant ERR_ITEM_NOT_OWNED (err u510))
(define-constant ERR_INVALID_ITEM_TYPE (err u511))
(define-constant ERR_BADGE_REQUIREMENT_NOT_MET (err u512))

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant MAX_ROOM_ITEMS u50) ;; Maximum items per user room
(define-constant ROOM_SIZE_X u1000) ;; Room dimensions (arbitrary units)
(define-constant ROOM_SIZE_Y u1000)
(define-constant ROOM_SIZE_Z u300)

;; Item categories
(define-constant CATEGORY_FURNITURE u1)
(define-constant CATEGORY_DECORATION u2)
(define-constant CATEGORY_TECH u3)
(define-constant CATEGORY_PLANTS u4)
(define-constant CATEGORY_LIGHTING u5)
(define-constant CATEGORY_SPECIAL u6) ;; Unlocked by badges

;; Define the NFT for room items
(define-non-fungible-token room-item uint)

;; Contract state
(define-data-var contract-paused bool false)
(define-data-var last-item-id uint u0)
(define-data-var total-items-minted uint u0)
(define-data-var achiv-token-contract principal tx-sender)
(define-data-var nft-badges-contract principal tx-sender)

;; Item templates (what can be purchased)
(define-map item-templates
  uint ;; template-id
  {
    name: (string-ascii 100),
    description: (string-ascii 300),
    category: uint,
    price-achiv: uint,
    model-uri: (string-ascii 200), ;; 3D model file URI
    thumbnail-uri: (string-ascii 200),
    rarity: (string-ascii 20),
    is-available: bool,
    badge-requirement: (optional uint), ;; Required badge type to unlock
    dimensions: { width: uint, height: uint, depth: uint },
    special-effects: (string-ascii 100) ;; Particle effects, animations, etc.
  }
)

;; User rooms and item placement
(define-map user-rooms
  principal
  {
    total-items: uint,
    room-theme: (string-ascii 50),
    last-updated: uint,
    room-level: uint, ;; Higher levels unlock more space/features
    background-music: (string-ascii 100)
  }
)

;; Item placement in rooms
(define-map item-placements
  { owner: principal, item-id: uint }
  {
    position: { x: uint, y: uint, z: uint },
    rotation: { x: uint, y: uint, z: uint }, ;; Rotation in degrees
    scale: uint, ;; Scale factor (100 = normal size)
    is-placed: bool,
    placed-at: uint
  }
)

;; Item ownership and metadata
(define-map item-metadata
  uint ;; item-id (NFT token ID)
  {
    template-id: uint,
    owner: principal,
    purchased-at: uint,
    purchase-price: uint,
    custom-name: (optional (string-ascii 50)),
    upgrade-level: uint
  }
)

;; Initialize item templates
(map-set item-templates u1
  {
    name: "Modern Desk",
    description: "A sleek modern desk perfect for productivity",
    category: CATEGORY_FURNITURE,
    price-achiv: u5000000, ;; 5 ACHIV tokens
    model-uri: "models/furniture/modern-desk.glb",
    thumbnail-uri: "images/furniture/modern-desk.jpg",
    rarity: "common",
    is-available: true,
    badge-requirement: none,
    dimensions: { width: u200, height: u80, depth: u100 },
    special-effects: ""
  }
)

(map-set item-templates u2
  {
    name: "Gaming Chair",
    description: "Comfortable gaming chair for long habit sessions",
    category: CATEGORY_FURNITURE,
    price-achiv: u8000000, ;; 8 ACHIV tokens
    model-uri: "models/furniture/gaming-chair.glb",
    thumbnail-uri: "images/furniture/gaming-chair.jpg",
    rarity: "common",
    is-available: true,
    badge-requirement: none,
    dimensions: { width: u80, height: u120, depth: u80 },
    special-effects: ""
  }
)

(map-set item-templates u3
  {
    name: "Motivational Poster",
    description: "Inspiring poster to keep you motivated",
    category: CATEGORY_DECORATION,
    price-achiv: u2000000, ;; 2 ACHIV tokens
    model-uri: "models/decoration/poster.glb",
    thumbnail-uri: "images/decoration/poster.jpg",
    rarity: "common",
    is-available: true,
    badge-requirement: none,
    dimensions: { width: u100, height: u150, depth: u5 },
    special-effects: ""
  }
)

(map-set item-templates u4
  {
    name: "Golden Trophy",
    description: "Prestigious trophy for streak champions",
    category: CATEGORY_SPECIAL,
    price-achiv: u20000000, ;; 20 ACHIV tokens
    model-uri: "models/special/golden-trophy.glb",
    thumbnail-uri: "images/special/golden-trophy.jpg",
    rarity: "legendary",
    is-available: true,
    badge-requirement: (some u1), ;; Requires streak badge
    dimensions: { width: u50, height: u100, depth: u50 },
    special-effects: "golden-glow"
  }
)

(map-set item-templates u5
  {
    name: "Smart Monitor",
    description: "High-tech monitor displaying your progress",
    category: CATEGORY_TECH,
    price-achiv: u12000000, ;; 12 ACHIV tokens
    model-uri: "models/tech/smart-monitor.glb",
    thumbnail-uri: "images/tech/smart-monitor.jpg",
    rarity: "rare",
    is-available: true,
    badge-requirement: none,
    dimensions: { width: u120, height: u80, depth: u20 },
    special-effects: "screen-glow"
  }
)

;; Admin functions

;; Set contract addresses
(define-public (set-achiv-token-contract (token-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set achiv-token-contract token-contract))
  )
)

(define-public (set-nft-badges-contract (badges-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set nft-badges-contract badges-contract))
  )
)

;; Add new item template
(define-public (add-item-template
    (template-id uint)
    (name (string-ascii 100))
    (description (string-ascii 300))
    (category uint)
    (price-achiv uint)
    (model-uri (string-ascii 200))
    (thumbnail-uri (string-ascii 200))
    (rarity (string-ascii 20))
    (badge-requirement (optional uint))
    (dimensions { width: uint, height: uint, depth: uint })
    (special-effects (string-ascii 100))
  )
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    
    (map-set item-templates template-id
      {
        name: name,
        description: description,
        category: category,
        price-achiv: price-achiv,
        model-uri: model-uri,
        thumbnail-uri: thumbnail-uri,
        rarity: rarity,
        is-available: true,
        badge-requirement: badge-requirement,
        dimensions: dimensions,
        special-effects: special-effects
      }
    )
    
    (print {
      action: "item-template-added",
      template-id: template-id,
      name: name,
      price: price-achiv
    })
    
    (ok template-id)
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

;; NFT Trait Implementation

(define-read-only (get-last-token-id)
  (ok (var-get last-item-id))
)

(define-read-only (get-token-uri (token-id uint))
  (match (map-get? item-metadata token-id)
    metadata
      (match (map-get? item-templates (get template-id metadata))
        template (ok (some (get thumbnail-uri template)))
        (ok none)
      )
    (ok none)
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? room-item token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (asserts! (is-some (nft-get-owner? room-item token-id)) ERR_TOKEN_NOT_FOUND)
    
    ;; Remove item from sender's room if placed
    ;; TODO: Implement remove-item-from-room function
    ;; (try! (remove-item-from-room sender token-id))
    
    ;; Update metadata
    (match (map-get? item-metadata token-id)
      metadata
        (map-set item-metadata token-id (merge metadata { owner: recipient }))
      false
    )
    
    ;; Perform transfer
    (nft-transfer? room-item token-id sender recipient)
  )
)

;; Core item functions

;; Purchase an item with ACHIV tokens
(define-public (purchase-item (template-id uint))
  (let 
    (
      (template (unwrap! (map-get? item-templates template-id) ERR_INVALID_ITEM_TYPE))
      (price (get price-achiv template))
      (new-item-id (+ (var-get last-item-id) u1))
    )
    (begin
      ;; Security and availability checks
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-standard tx-sender) ERR_INVALID_USER)
      (asserts! (get is-available template) ERR_ITEM_NOT_AVAILABLE)
      
      ;; Check badge requirement if any
      ;; TODO: Re-enable after contract deployment
      ;; (match (get badge-requirement template)
      ;;   required-badge-type
      ;;     (asserts! 
      ;;       (contract-call? (var-get nft-badges-contract) user-owns-badge-type tx-sender required-badge-type)
      ;;       ERR_BADGE_REQUIREMENT_NOT_MET
      ;;     )
      ;;   true ;; No badge requirement
      ;; )
      
      ;; Check ACHIV token balance and transfer payment
      ;; TODO: Re-enable after contract deployment
      ;; (asserts! 
      ;;   (>= (unwrap-panic (contract-call? (var-get achiv-token-contract) get-balance tx-sender)) price)
      ;;   ERR_INSUFFICIENT_FUNDS
      ;; )
      
      ;; Burn ACHIV tokens as payment (deflationary mechanism)
      ;; TODO: Re-enable after contract deployment
      ;; (try! (contract-call? (var-get achiv-token-contract) burn price tx-sender))
      
      ;; Mint the room item NFT
      (try! (nft-mint? room-item new-item-id tx-sender))
      
      ;; Set item metadata
      (map-set item-metadata new-item-id
        {
          template-id: template-id,
          owner: tx-sender,
          purchased-at: stacks-block-height,
          purchase-price: price,
          custom-name: none,
          upgrade-level: u1
        }
      )
      
      ;; Update contract state
      (var-set last-item-id new-item-id)
      (var-set total-items-minted (+ (var-get total-items-minted) u1))
      
      ;; Initialize user room if first item
      (if (is-none (map-get? user-rooms tx-sender))
        (map-set user-rooms tx-sender
          {
            total-items: u1,
            room-theme: "default",
            last-updated: stacks-block-height,
            room-level: u1,
            background-music: "ambient-1"
          }
        )
        (let ((room-data (unwrap-panic (map-get? user-rooms tx-sender))))
          (map-set user-rooms tx-sender
            (merge room-data {
              total-items: (+ (get total-items room-data) u1),
              last-updated: stacks-block-height
            })
          )
        )
      )
      
      ;; Log purchase event
      (print {
        action: "item-purchased",
        buyer: tx-sender,
        item-id: new-item-id,
        template-id: template-id,
        price: price,
        item-name: (get name template)
      })
      
      (ok new-item-id)
    )
  )
)

;; Place item in room at specific position
(define-public (place-item-in-room 
    (item-id uint)
    (position { x: uint, y: uint, z: uint })
    (rotation { x: uint, y: uint, z: uint })
    (scale uint)
  )
  (let 
    (
      (item-data (unwrap! (map-get? item-metadata item-id) ERR_TOKEN_NOT_FOUND))
      (room-data (unwrap! (map-get? user-rooms tx-sender) ERR_INVALID_USER))
      (template (unwrap! (map-get? item-templates (get template-id item-data)) ERR_INVALID_ITEM_TYPE))
    )
    (begin
      ;; Security checks
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-eq (get owner item-data) tx-sender) ERR_ITEM_NOT_OWNED)
      (asserts! (< (get total-items room-data) MAX_ROOM_ITEMS) ERR_ROOM_FULL)
      
      ;; Validate position within room bounds
      (asserts! (and 
        (< (get x position) ROOM_SIZE_X)
        (< (get y position) ROOM_SIZE_Y)
        (< (get z position) ROOM_SIZE_Z)
      ) ERR_INVALID_POSITION)
      
      ;; Validate scale (50% to 200%)
      (asserts! (and (>= scale u50) (<= scale u200)) ERR_INVALID_POSITION)
      
      ;; Place the item
      (map-set item-placements
        { owner: tx-sender, item-id: item-id }
        {
          position: position,
          rotation: rotation,
          scale: scale,
          is-placed: true,
          placed-at: stacks-block-height
        }
      )
      
      ;; Update room data
      (map-set user-rooms tx-sender
        (merge room-data { last-updated: stacks-block-height })
      )
      
      ;; Log placement event
      (print {
        action: "item-placed",
        owner: tx-sender,
        item-id: item-id,
        position: position,
        rotation: rotation,
        scale: scale
      })
      
      (ok true)
    )
  )
)

;; Remove item from room (but keep ownership)
(define-public (remove-item-from-room (owner principal) (item-id uint))
  (let ((placement-data (map-get? item-placements { owner: owner, item-id: item-id })))
    (begin
      (match placement-data
        placement
          (begin
            (map-set item-placements
              { owner: owner, item-id: item-id }
              (merge placement { is-placed: false })
            )
            
            (print {
              action: "item-removed-from-room",
              owner: owner,
              item-id: item-id
            })
            
            (ok true)
          )
        (ok true) ;; Item wasn't placed anyway
      )
    )
  )
)

;; Customize item (rename, upgrade)
(define-public (customize-item (item-id uint) (custom-name (optional (string-ascii 50))))
  (let ((item-data (unwrap! (map-get? item-metadata item-id) ERR_TOKEN_NOT_FOUND)))
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-eq (get owner item-data) tx-sender) ERR_ITEM_NOT_OWNED)
      
      (map-set item-metadata item-id
        (merge item-data { custom-name: custom-name })
      )
      
      (print {
        action: "item-customized",
        owner: tx-sender,
        item-id: item-id,
        custom-name: custom-name
      })
      
      (ok true)
    )
  )
)

;; Change room theme
(define-public (change-room-theme (theme (string-ascii 50)) (background-music (string-ascii 100)))
  (let ((room-data (unwrap! (map-get? user-rooms tx-sender) ERR_INVALID_USER)))
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      
      (map-set user-rooms tx-sender
        (merge room-data {
          room-theme: theme,
          background-music: background-music,
          last-updated: block-height
        })
      )
      
      (print {
        action: "room-theme-changed",
        owner: tx-sender,
        theme: theme,
        music: background-music
      })
      
      (ok true)
    )
  )
)

;; Read-only functions

;; Get item template details
(define-read-only (get-item-template (template-id uint))
  (map-get? item-templates template-id)
)

;; Get item metadata
(define-read-only (get-item-metadata (item-id uint))
  (map-get? item-metadata item-id)
)

;; Get user's room information
(define-read-only (get-user-room (user principal))
  (map-get? user-rooms user)
)

;; Get item placement in room
(define-read-only (get-item-placement (owner principal) (item-id uint))
  (map-get? item-placements { owner: owner, item-id: item-id })
)

;; Get user's owned items (simplified - would need iteration in full implementation)
(define-read-only (get-user-items (user principal))
  ;; This would return a list of item IDs owned by the user
  ;; For now, return room data as proxy
  (map-get? user-rooms user)
)

;; Get available item templates for purchase
(define-read-only (get-available-templates)
  ;; In full implementation, would return list of available template IDs
  ;; For now, return contract stats
  {
    total-templates: u5,
    total-items-minted: (var-get total-items-minted),
    contract-paused: (var-get contract-paused)
  }
)

;; Check if user can afford item
(define-read-only (can-afford-item (user principal) (template-id uint))
  (match (map-get? item-templates template-id)
    template
      ;; TODO: Re-enable after contract deployment
      ;; (let ((user-balance (unwrap-panic (contract-call? (var-get achiv-token-contract) get-balance user))))
      (let ((user-balance u1000000)) ;; Temporary placeholder
        (>= user-balance (get price-achiv template))
      )
    false
  )
)

;; Get contract statistics
(define-read-only (get-contract-stats)
  {
    total-items-minted: (var-get total-items-minted),
    last-item-id: (var-get last-item-id),
    contract-paused: (var-get contract-paused)
  }
)
