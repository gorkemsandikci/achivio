;; ACHIV Token Contract - Motivational Habit Tracker Reward System
;; This contract implements the SIP-010 community-standard Fungible Token trait.
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Define the ACHIV fungible token with no maximum supply
(define-fungible-token achiv-token)

;; Define error constants
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))
(define-constant ERR_INVALID_AMOUNT (err u103))
(define-constant ERR_CONTRACT_PAUSED (err u104))
(define-constant ERR_UNAUTHORIZED_MINTER (err u105))
(define-constant ERR_INVALID_RECIPIENT (err u106))

;; Define constants for the ACHIV token contract
(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_URI u"https://achivio.app/token-metadata") ;; ACHIV token metadata
(define-constant TOKEN_NAME "Achivio Token")
(define-constant TOKEN_SYMBOL "ACHIV")
(define-constant TOKEN_DECIMALS u6) ;; 6 decimal places for micro-rewards
(define-constant BASE_REWARD_AMOUNT u1000000) ;; 1 ACHIV token base reward (1.000000)
(define-constant STREAK_BONUS_MULTIPLIER u500000) ;; 0.5 ACHIV bonus per streak day

;; Contract state variables
(define-data-var contract-paused bool false)
(define-data-var total-rewards-distributed uint u0)

;; Authorized minters mapping (for task-tracker and other contracts)
(define-map authorized-minters principal bool)

;; Initialize authorized minters (contract owner is automatically authorized)
(map-set authorized-minters CONTRACT_OWNER true)

;; SIP-010 function: Get the token balance of a specified principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance achiv-token who))
)

;; SIP-010 function: Returns the total supply of fungible token
(define-read-only (get-total-supply)
  (ok (ft-get-supply achiv-token))
)

;; SIP-010 function: Returns the human-readable token name
(define-read-only (get-name)
  (ok TOKEN_NAME)
)

;; SIP-010 function: Returns the symbol or "ticker" for this token
(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

;; SIP-010 function: Returns number of decimals to display
(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

;; SIP-010 function: Returns the URI containing token metadata
(define-read-only (get-token-uri)
  (ok (some TOKEN_URI))
)

;; Admin functions for contract management

;; Add authorized minter (only contract owner)
(define-public (add-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (ok (map-set authorized-minters minter true))
  )
)

;; Remove authorized minter (only contract owner)
(define-public (remove-authorized-minter (minter principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (map-delete authorized-minters minter))
  )
)

;; Check if principal is authorized minter
(define-read-only (is-authorized-minter (minter principal))
  (default-to false (map-get? authorized-minters minter))
)

;; Pause contract (emergency function)
(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set contract-paused true))
  )
)

;; Unpause contract
(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set contract-paused false))
  )
)

;; Get contract pause status
(define-read-only (is-paused)
  (var-get contract-paused)
)

;; Get total rewards distributed
(define-read-only (get-total-rewards-distributed)
  (var-get total-rewards-distributed)
)

;; Mint new ACHIV tokens - only authorized minters can call this
;; This will be called by task-tracker contract when users complete habits
(define-public (mint-reward
    (amount uint)
    (recipient principal)
  )
  (begin
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-authorized-minter tx-sender) ERR_UNAUTHORIZED_MINTER)
    (asserts! (is-standard recipient) ERR_INVALID_RECIPIENT)
    
    ;; Mint tokens and update total rewards
    (try! (ft-mint? achiv-token amount recipient))
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) amount))
    (print {
      action: "mint-reward",
      recipient: recipient,
      amount: amount,
      total-distributed: (var-get total-rewards-distributed)
    })
    (ok amount)
  )
)

;; Admin mint function (only contract owner for initial distribution)
(define-public (admin-mint
    (amount uint)
    (recipient principal)
  )
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-standard recipient) ERR_INVALID_RECIPIENT)
    
    (try! (ft-mint? achiv-token amount recipient))
    (print {
      action: "admin-mint",
      recipient: recipient,
      amount: amount
    })
    (ok amount)
  )
)

;; SIP-010 function: Transfers tokens to a recipient
;; Sender must be the same as the caller to prevent principals from transferring tokens they do not own.
(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal)
    (memo (optional (buff 34)))
  )
  (begin
    ;; Security checks
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-standard recipient) ERR_INVALID_RECIPIENT)
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender))
      ERR_NOT_TOKEN_OWNER
    )
    
    ;; Check sufficient balance
    (asserts! (>= (ft-get-balance achiv-token sender) amount) ERR_INSUFFICIENT_BALANCE)
    
    ;; Perform transfer
    (try! (ft-transfer? achiv-token amount sender recipient))
    
    ;; Print memo if provided
    (match memo
      to-print (print to-print)
      0x
    )
    
    ;; Log transfer event
    (print {
      action: "transfer",
      sender: sender,
      recipient: recipient,
      amount: amount
    })
    
    (ok true)
  )
)

;; Burn tokens (reduce supply) - useful for deflationary mechanics
(define-public (burn
    (amount uint)
    (owner principal)
  )
  (begin
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (or (is-eq tx-sender owner) (is-eq contract-caller owner))
      ERR_NOT_TOKEN_OWNER
    )
    (asserts! (>= (ft-get-balance achiv-token owner) amount) ERR_INSUFFICIENT_BALANCE)
    
    (try! (ft-burn? achiv-token amount owner))
    (print {
      action: "burn",
      owner: owner,
      amount: amount
    })
    (ok amount)
  )
)
