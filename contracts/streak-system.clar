;; Streak System Contract - Consecutive Day Tracking and Bonus Rewards
;; This contract manages user streaks and provides bonus ACHIV token rewards for consistency

;; Error constants
(define-constant ERR_OWNER_ONLY (err u300))
(define-constant ERR_UNAUTHORIZED (err u301))
(define-constant ERR_CONTRACT_PAUSED (err u302))
(define-constant ERR_INVALID_USER (err u303))
(define-constant ERR_STREAK_NOT_FOUND (err u304))
(define-constant ERR_NO_ACTIVITY_TODAY (err u305))
(define-constant ERR_STREAK_ALREADY_CLAIMED (err u306))
(define-constant ERR_INSUFFICIENT_STREAK (err u307))
(define-constant ERR_TOKEN_CONTRACT_ERROR (err u308))

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant STREAK_BONUS_BASE u500000) ;; 0.5 ACHIV base bonus
(define-constant STREAK_MULTIPLIER_THRESHOLD u7) ;; 7-day streak for multiplier
(define-constant MAX_STREAK_BONUS u5000000) ;; 5 ACHIV max bonus per day
(define-constant MILESTONE_REWARDS (list u7 u14 u30 u60 u100 u365)) ;; Streak milestones

;; Contract state
(define-data-var contract-paused bool false)
(define-data-var total-streak-rewards-distributed uint u0)
(define-data-var achiv-token-contract principal tx-sender)
(define-data-var task-tracker-contract principal tx-sender)

;; User streak data
(define-map user-streaks
  principal
  {
    current-streak: uint,
    longest-streak: uint,
    last-activity-date: uint,
    streak-start-date: uint,
    total-streak-rewards: uint,
    milestone-achievements: (list 10 uint) ;; List of achieved milestones
  }
)

;; Daily streak bonus tracking
(define-map daily-streak-bonuses
  { user: principal, date: uint }
  {
    streak-length: uint,
    bonus-amount: uint,
    claimed: bool,
    tasks-completed: uint
  }
)

;; Streak milestone rewards
(define-map milestone-rewards
  uint ;; milestone (days)
  {
    reward-amount: uint,
    badge-unlocked: bool,
    description: (string-ascii 200)
  }
)

;; Initialize milestone rewards
(map-set milestone-rewards u7 
  { reward-amount: u2000000, badge-unlocked: true, description: "Week Warrior - 7 day streak!" })
(map-set milestone-rewards u14 
  { reward-amount: u5000000, badge-unlocked: true, description: "Fortnight Fighter - 14 day streak!" })
(map-set milestone-rewards u30 
  { reward-amount: u12000000, badge-unlocked: true, description: "Monthly Master - 30 day streak!" })
(map-set milestone-rewards u60 
  { reward-amount: u25000000, badge-unlocked: true, description: "Bimonthly Beast - 60 day streak!" })
(map-set milestone-rewards u100 
  { reward-amount: u50000000, badge-unlocked: true, description: "Centurion Champion - 100 day streak!" })
(map-set milestone-rewards u365 
  { reward-amount: u100000000, badge-unlocked: true, description: "Annual Achiever - 365 day streak!" })

;; Admin functions

;; Set contract addresses
(define-public (set-token-contract (token-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set achiv-token-contract token-contract))
  )
)

(define-public (set-task-tracker-contract (tracker-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set task-tracker-contract tracker-contract))
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

;; Read-only functions

;; Get current date (same logic as task-tracker)
(define-read-only (get-current-date)
  (/ block-height u144) ;; Assuming ~144 blocks per day
)

;; Get user streak information
(define-read-only (get-user-streak (user principal))
  (map-get? user-streaks user)
)

;; Get daily streak bonus info
(define-read-only (get-daily-streak-bonus (user principal) (date uint))
  (map-get? daily-streak-bonuses { user: user, date: date })
)

;; Get milestone reward details
(define-read-only (get-milestone-reward (milestone uint))
  (map-get? milestone-rewards milestone)
)

;; Calculate streak bonus based on current streak length
(define-read-only (calculate-streak-bonus (streak-length uint))
  (let 
    (
      (base-bonus STREAK_BONUS_BASE)
      (multiplier (if (>= streak-length STREAK_MULTIPLIER_THRESHOLD)
                    (min (/ streak-length u7) u10) ;; Max 10x multiplier
                    u1))
    )
    (min (* base-bonus multiplier) MAX_STREAK_BONUS)
  )
)

;; Check if user has achieved a milestone
(define-read-only (has-achieved-milestone (user principal) (milestone uint))
  (match (map-get? user-streaks user)
    user-streak-data
      (is-some (index-of (get milestone-achievements user-streak-data) milestone))
    false
  )
)

;; Core streak functions

;; Update user streak (called by task-tracker when user completes tasks)
(define-public (update-user-streak (user principal) (tasks-completed-today uint))
  (let 
    (
      (current-date (get-current-date))
      (yesterday (- current-date u1))
      (user-streak-data (default-to
        {
          current-streak: u0,
          longest-streak: u0,
          last-activity-date: u0,
          streak-start-date: current-date,
          total-streak-rewards: u0,
          milestone-achievements: (list)
        }
        (map-get? user-streaks user)
      ))
    )
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-standard user) ERR_INVALID_USER)
      (asserts! (> tasks-completed-today u0) ERR_NO_ACTIVITY_TODAY)
      
      (let 
        (
          (last-activity (get last-activity-date user-streak-data))
          (current-streak (get current-streak user-streak-data))
          (new-streak (if (is-eq last-activity yesterday)
                        (+ current-streak u1) ;; Continue streak
                        (if (is-eq last-activity current-date)
                          current-streak ;; Same day, no change
                          u1 ;; New streak starts
                        )))
          (new-longest (max new-streak (get longest-streak user-streak-data)))
          (streak-bonus (calculate-streak-bonus new-streak))
        )
        (begin
          ;; Update user streak data
          (map-set user-streaks user
            (merge user-streak-data {
              current-streak: new-streak,
              longest-streak: new-longest,
              last-activity-date: current-date,
              streak-start-date: (if (is-eq new-streak u1) current-date (get streak-start-date user-streak-data))
            })
          )
          
          ;; Record daily streak bonus
          (map-set daily-streak-bonuses
            { user: user, date: current-date }
            {
              streak-length: new-streak,
              bonus-amount: streak-bonus,
              claimed: false,
              tasks-completed: tasks-completed-today
            }
          )
          
          ;; Check for milestone achievements
          (try! (check-and-award-milestones user new-streak))
          
          ;; Log streak update
          (print {
            action: "streak-updated",
            user: user,
            current-streak: new-streak,
            longest-streak: new-longest,
            bonus-amount: streak-bonus,
            date: current-date
          })
          
          (ok new-streak)
        )
      )
    )
  )
)

;; Claim daily streak bonus
(define-public (claim-streak-bonus (date uint))
  (let 
    (
      (bonus-data (unwrap! (map-get? daily-streak-bonuses { user: tx-sender, date: date }) ERR_STREAK_NOT_FOUND))
      (user-streak-data (unwrap! (map-get? user-streaks tx-sender) ERR_STREAK_NOT_FOUND))
    )
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (not (get claimed bonus-data)) ERR_STREAK_ALREADY_CLAIMED)
      
      (let ((bonus-amount (get bonus-amount bonus-data)))
        (begin
          ;; Mark bonus as claimed
          (map-set daily-streak-bonuses
            { user: tx-sender, date: date }
            (merge bonus-data { claimed: true })
          )
          
          ;; Update user's total streak rewards
          (map-set user-streaks tx-sender
            (merge user-streak-data {
              total-streak-rewards: (+ (get total-streak-rewards user-streak-data) bonus-amount)
            })
          )
          
          ;; Update global stats
          (var-set total-streak-rewards-distributed 
            (+ (var-get total-streak-rewards-distributed) bonus-amount))
          
          ;; Mint bonus ACHIV tokens
          (try! (contract-call? (var-get achiv-token-contract) mint-reward bonus-amount tx-sender))
          
          ;; Log bonus claim
          (print {
            action: "streak-bonus-claimed",
            user: tx-sender,
            date: date,
            bonus-amount: bonus-amount,
            streak-length: (get streak-length bonus-data)
          })
          
          (ok bonus-amount)
        )
      )
    )
  )
)

;; Check and award milestone achievements
(define-private (check-and-award-milestones (user principal) (current-streak uint))
  (let ((user-streak-data (unwrap! (map-get? user-streaks user) ERR_STREAK_NOT_FOUND)))
    (begin
      ;; Check each milestone
      (if (and (>= current-streak u7) (not (has-achieved-milestone user u7)))
        (try! (award-milestone user u7))
        (ok true)
      )
      
      (if (and (>= current-streak u14) (not (has-achieved-milestone user u14)))
        (try! (award-milestone user u14))
        (ok true)
      )
      
      (if (and (>= current-streak u30) (not (has-achieved-milestone user u30)))
        (try! (award-milestone user u30))
        (ok true)
      )
      
      (if (and (>= current-streak u60) (not (has-achieved-milestone user u60)))
        (try! (award-milestone user u60))
        (ok true)
      )
      
      (if (and (>= current-streak u100) (not (has-achieved-milestone user u100)))
        (try! (award-milestone user u100))
        (ok true)
      )
      
      (if (and (>= current-streak u365) (not (has-achieved-milestone user u365)))
        (try! (award-milestone user u365))
        (ok true)
      )
      
      (ok true)
    )
  )
)

;; Award milestone achievement
(define-private (award-milestone (user principal) (milestone uint))
  (let 
    (
      (user-streak-data (unwrap! (map-get? user-streaks user) ERR_STREAK_NOT_FOUND))
      (milestone-data (unwrap! (map-get? milestone-rewards milestone) ERR_STREAK_NOT_FOUND))
      (reward-amount (get reward-amount milestone-data))
    )
    (begin
      ;; Add milestone to user's achievements
      (map-set user-streaks user
        (merge user-streak-data {
          milestone-achievements: (unwrap-panic (as-max-len? 
            (append (get milestone-achievements user-streak-data) milestone) u10))
        })
      )
      
      ;; Mint milestone reward
      (try! (contract-call? (var-get achiv-token-contract) mint-reward reward-amount user))
      
      ;; Log milestone achievement
      (print {
        action: "milestone-achieved",
        user: user,
        milestone: milestone,
        reward-amount: reward-amount,
        description: (get description milestone-data)
      })
      
      (ok milestone)
    )
  )
)

;; Get user's claimable streak bonuses
(define-read-only (get-claimable-bonuses (user principal))
  ;; In a full implementation, this would iterate through dates
  ;; For now, return current date bonus if available
  (let ((current-date (get-current-date)))
    (match (map-get? daily-streak-bonuses { user: user, date: current-date })
      bonus-data
        (if (get claimed bonus-data)
          (ok { date: current-date, amount: u0, claimable: false })
          (ok { date: current-date, amount: (get bonus-amount bonus-data), claimable: true })
        )
      (ok { date: current-date, amount: u0, claimable: false })
    )
  )
)

;; Reset user streak (admin function for testing or penalties)
(define-public (admin-reset-streak (user principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    
    (match (map-get? user-streaks user)
      user-streak-data
        (begin
          (map-set user-streaks user
            (merge user-streak-data {
              current-streak: u0,
              streak-start-date: (get-current-date)
            })
          )
          
          (print {
            action: "admin-streak-reset",
            user: user,
            admin: tx-sender
          })
          
          (ok true)
        )
      ERR_STREAK_NOT_FOUND
    )
  )
)

;; Get total streak statistics
(define-read-only (get-streak-stats)
  {
    total-rewards-distributed: (var-get total-streak-rewards-distributed),
    contract-paused: (var-get contract-paused)
  }
)
