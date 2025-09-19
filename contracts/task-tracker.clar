;; Task Tracker Contract - Core Habit Tracking System for Achivio
;; This contract manages daily habit completion, prevents double rewards, and integrates with ACHIV token rewards

;; Import error constants and types
(use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Error constants
(define-constant ERR_OWNER_ONLY (err u200))
(define-constant ERR_TASK_NOT_FOUND (err u201))
(define-constant ERR_TASK_ALREADY_COMPLETED (err u202))
(define-constant ERR_INVALID_TASK_ID (err u203))
(define-constant ERR_UNAUTHORIZED (err u204))
(define-constant ERR_CONTRACT_PAUSED (err u205))
(define-constant ERR_INVALID_USER (err u206))
(define-constant ERR_TASK_ALREADY_EXISTS (err u207))
(define-constant ERR_INVALID_REWARD_AMOUNT (err u208))
(define-constant ERR_TOKEN_CONTRACT_ERROR (err u209))
(define-constant ERR_INVALID_DATE (err u210))

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant MAX_TASKS_PER_USER u50)
(define-constant SECONDS_IN_DAY u86400) ;; 24 * 60 * 60
(define-constant BASE_REWARD u1000000) ;; 1 ACHIV token (1.000000)

;; Contract state
(define-data-var contract-paused bool false)
(define-data-var total-tasks-completed uint u0)
(define-data-var total-users uint u0)
(define-data-var achiv-token-contract principal tx-sender) ;; Will be set to actual token contract

;; Task definition structure
(define-map tasks 
  { task-id: uint } 
  {
    creator: principal,
    title: (string-ascii 100),
    description: (string-ascii 500),
    reward-amount: uint,
    category: (string-ascii 50),
    difficulty: uint, ;; 1-5 scale
    is-active: bool,
    created-at: uint,
    total-completions: uint
  }
)

;; User task completion tracking - prevents double rewards per day
(define-map user-task-completions
  { user: principal, task-id: uint, date: uint } ;; date as block height / blocks per day
  {
    completed-at: uint,
    reward-earned: uint,
    streak-bonus: uint
  }
)

;; User daily stats
(define-map user-daily-stats
  { user: principal, date: uint }
  {
    tasks-completed: uint,
    total-rewards: uint,
    completion-percentage: uint
  }
)

;; User profile and progress
(define-map user-profiles
  principal
  {
    total-tasks-completed: uint,
    total-rewards-earned: uint,
    current-streak: uint,
    longest-streak: uint,
    level: uint,
    joined-at: uint,
    last-activity: uint
  }
)

;; Task counter for unique IDs
(define-data-var task-id-nonce uint u0)

;; Admin functions

;; Set the ACHIV token contract address (only owner)
(define-public (set-token-contract (token-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set achiv-token-contract token-contract))
  )
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

;; Read-only functions

;; Get contract pause status
(define-read-only (is-paused)
  (var-get contract-paused)
)

;; Get total statistics
(define-read-only (get-total-stats)
  {
    total-tasks-completed: (var-get total-tasks-completed),
    total-users: (var-get total-users),
    contract-paused: (var-get contract-paused)
  }
)

;; Get task details
(define-read-only (get-task (task-id uint))
  (map-get? tasks { task-id: task-id })
)

;; Get user profile
(define-read-only (get-user-profile (user principal))
  (map-get? user-profiles user)
)

;; Check if user completed task on specific date
(define-read-only (is-task-completed-today (user principal) (task-id uint))
  (let ((current-date (get-current-date)))
    (is-some (map-get? user-task-completions { user: user, task-id: task-id, date: current-date }))
  )
)

;; Get user's daily stats
(define-read-only (get-user-daily-stats (user principal) (date uint))
  (map-get? user-daily-stats { user: user, date: date })
)

;; Get current date (simplified as block height divided by average blocks per day)
(define-read-only (get-current-date)
  (/ block-height u144) ;; Assuming ~144 blocks per day (10 min blocks)
)

;; Task management functions

;; Create a new habit/task (anyone can create)
(define-public (create-task 
    (title (string-ascii 100))
    (description (string-ascii 500))
    (reward-amount uint)
    (category (string-ascii 50))
    (difficulty uint)
  )
  (let 
    (
      (new-task-id (+ (var-get task-id-nonce) u1))
    )
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-standard tx-sender) ERR_INVALID_USER)
      (asserts! (and (> difficulty u0) (<= difficulty u5)) ERR_INVALID_TASK_ID)
      (asserts! (> reward-amount u0) ERR_INVALID_REWARD_AMOUNT)
      
      ;; Create the task
      (map-set tasks 
        { task-id: new-task-id }
        {
          creator: tx-sender,
          title: title,
          description: description,
          reward-amount: reward-amount,
          category: category,
          difficulty: difficulty,
          is-active: true,
          created-at: block-height,
          total-completions: u0
        }
      )
      
      ;; Update task ID counter
      (var-set task-id-nonce new-task-id)
      
      ;; Log task creation
      (print {
        action: "task-created",
        task-id: new-task-id,
        creator: tx-sender,
        title: title,
        category: category,
        difficulty: difficulty,
        reward-amount: reward-amount
      })
      
      (ok new-task-id)
    )
  )
)

;; Core function: Complete a task and earn ACHIV tokens
(define-public (complete-task (task-id uint))
  (let 
    (
      (task-data (unwrap! (map-get? tasks { task-id: task-id }) ERR_TASK_NOT_FOUND))
      (current-date (get-current-date))
      (user-profile (default-to 
        {
          total-tasks-completed: u0,
          total-rewards-earned: u0,
          current-streak: u0,
          longest-streak: u0,
          level: u1,
          joined-at: block-height,
          last-activity: block-height
        }
        (map-get? user-profiles tx-sender)
      ))
      (reward-amount (get reward-amount task-data))
    )
    (begin
      ;; Security and validation checks
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-standard tx-sender) ERR_INVALID_USER)
      (asserts! (get is-active task-data) ERR_TASK_NOT_FOUND)
      (asserts! (not (is-task-completed-today tx-sender task-id)) ERR_TASK_ALREADY_COMPLETED)
      
      ;; Record task completion
      (map-set user-task-completions
        { user: tx-sender, task-id: task-id, date: current-date }
        {
          completed-at: block-height,
          reward-earned: reward-amount,
          streak-bonus: u0 ;; Streak bonus will be calculated by streak-system contract
        }
      )
      
      ;; Update task completion count
      (map-set tasks 
        { task-id: task-id }
        (merge task-data { total-completions: (+ (get total-completions task-data) u1) })
      )
      
      ;; Update user profile
      (map-set user-profiles tx-sender
        (merge user-profile {
          total-tasks-completed: (+ (get total-tasks-completed user-profile) u1),
          total-rewards-earned: (+ (get total-rewards-earned user-profile) reward-amount),
          last-activity: block-height
        })
      )
      
      ;; Update daily stats
      (let ((daily-stats (default-to 
            { tasks-completed: u0, total-rewards: u0, completion-percentage: u0 }
            (map-get? user-daily-stats { user: tx-sender, date: current-date })
          )))
        (map-set user-daily-stats
          { user: tx-sender, date: current-date }
          {
            tasks-completed: (+ (get tasks-completed daily-stats) u1),
            total-rewards: (+ (get total-rewards daily-stats) reward-amount),
            completion-percentage: u0 ;; Will be calculated separately
          }
        )
      )
      
      ;; Update global stats
      (var-set total-tasks-completed (+ (var-get total-tasks-completed) u1))
      
      ;; Mint ACHIV tokens as reward
      (try! (contract-call? (var-get achiv-token-contract) mint-reward reward-amount tx-sender))
      
      ;; Log completion event
      (print {
        action: "task-completed",
        user: tx-sender,
        task-id: task-id,
        reward-earned: reward-amount,
        date: current-date,
        block-height: block-height
      })
      
      (ok reward-amount)
    )
  )
)

;; Deactivate a task (only creator or admin)
(define-public (deactivate-task (task-id uint))
  (let ((task-data (unwrap! (map-get? tasks { task-id: task-id }) ERR_TASK_NOT_FOUND)))
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (or (is-eq tx-sender (get creator task-data)) 
                    (is-eq tx-sender CONTRACT_OWNER)) ERR_UNAUTHORIZED)
      
      (map-set tasks 
        { task-id: task-id }
        (merge task-data { is-active: false })
      )
      
      (print {
        action: "task-deactivated",
        task-id: task-id,
        deactivated-by: tx-sender
      })
      
      (ok true)
    )
  )
)

;; Get user's completed tasks for a specific date
(define-read-only (get-user-completions-by-date (user principal) (date uint))
  ;; This would require iteration in a real implementation
  ;; For now, return a simple structure
  (ok { date: date, user: user })
)

;; Calculate user level based on total tasks completed
(define-read-only (calculate-user-level (tasks-completed uint))
  (if (<= tasks-completed u10) u1
    (if (<= tasks-completed u25) u2
      (if (<= tasks-completed u50) u3
        (if (<= tasks-completed u100) u4
          (if (<= tasks-completed u250) u5
            u6
          )
        )
      )
    )
  )
)

;; Update user level (can be called by anyone for any user)
(define-public (update-user-level (user principal))
  (let ((user-profile (unwrap! (map-get? user-profiles user) ERR_INVALID_USER)))
    (let ((new-level (calculate-user-level (get total-tasks-completed user-profile))))
      (begin
        (map-set user-profiles user
          (merge user-profile { level: new-level })
        )
        
        (print {
          action: "level-updated",
          user: user,
          new-level: new-level,
          tasks-completed: (get total-tasks-completed user-profile)
        })
        
        (ok new-level)
      )
    )
  )
)
