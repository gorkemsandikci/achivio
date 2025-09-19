;; Leaderboard Contract - User Rankings and Social Features for Achivio
;; This contract manages user rankings, achievements, and social comparison features

;; Error constants
(define-constant ERR_OWNER_ONLY (err u600))
(define-constant ERR_UNAUTHORIZED (err u601))
(define-constant ERR_CONTRACT_PAUSED (err u602))
(define-constant ERR_INVALID_USER (err u603))
(define-constant ERR_INVALID_TIMEFRAME (err u604))
(define-constant ERR_USER_NOT_FOUND (err u605))
(define-constant ERR_INVALID_CATEGORY (err u606))
(define-constant ERR_ALREADY_UPDATED_TODAY (err u607))
(define-constant ERR_INVALID_SCORE (err u608))

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant MAX_LEADERBOARD_SIZE u100)
(define-constant LEADERBOARD_UPDATE_REWARD u100000) ;; 0.1 ACHIV for updating leaderboard

;; Leaderboard categories
(define-constant CATEGORY_OVERALL u1)
(define-constant CATEGORY_STREAKS u2)
(define-constant CATEGORY_TASKS_COMPLETED u3)
(define-constant CATEGORY_REWARDS_EARNED u4)
(define-constant CATEGORY_BADGES_COLLECTED u5)

;; Timeframes
(define-constant TIMEFRAME_DAILY u1)
(define-constant TIMEFRAME_WEEKLY u2)
(define-constant TIMEFRAME_MONTHLY u3)
(define-constant TIMEFRAME_ALL_TIME u4)

;; Contract state
(define-data-var contract-paused bool false)
(define-data-var total-leaderboard-updates uint u0)
(define-data-var last-global-update uint u0)
(define-data-var achiv-token-contract principal tx-sender)
(define-data-var task-tracker-contract principal tx-sender)
(define-data-var streak-system-contract principal tx-sender)

;; User statistics for leaderboard calculation
(define-map user-stats
  principal
  {
    total-tasks-completed: uint,
    total-rewards-earned: uint,
    current-streak: uint,
    longest-streak: uint,
    total-badges: uint,
    level: uint,
    last-updated: uint,
    overall-score: uint, ;; Calculated composite score
    weekly-tasks: uint,
    monthly-tasks: uint
  }
)

;; Leaderboard entries
(define-map leaderboard-entries
  { category: uint, timeframe: uint, rank: uint }
  {
    user: principal,
    score: uint,
    display-name: (optional (string-ascii 50)),
    updated-at: uint
  }
)

;; User display preferences
(define-map user-profiles
  principal
  {
    display-name: (optional (string-ascii 50)),
    is-public: bool,
    show-in-leaderboards: bool,
    favorite-category: (string-ascii 50),
    join-date: uint,
    bio: (optional (string-ascii 200))
  }
)

;; Daily/weekly/monthly tracking
(define-map user-period-stats
  { user: principal, period-type: uint, period-id: uint }
  {
    tasks-completed: uint,
    rewards-earned: uint,
    streak-days: uint,
    badges-earned: uint,
    score: uint
  }
)

;; Global statistics
(define-map global-stats
  uint ;; stat-type (1=daily, 2=weekly, 3=monthly, 4=all-time)
  {
    total-active-users: uint,
    total-tasks-completed: uint,
    total-rewards-distributed: uint,
    average-streak: uint,
    top-performer: (optional principal),
    last-updated: uint
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

(define-public (set-task-tracker-contract (tracker-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set task-tracker-contract tracker-contract))
  )
)

(define-public (set-streak-system-contract (streak-contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ok (var-set streak-system-contract streak-contract))
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

;; User profile management

;; Set user display preferences
(define-public (set-user-profile
    (display-name (optional (string-ascii 50)))
    (is-public bool)
    (show-in-leaderboards bool)
    (favorite-category (string-ascii 50))
    (bio (optional (string-ascii 200)))
  )
  (begin
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (is-standard tx-sender) ERR_INVALID_USER)
    
    (map-set user-profiles tx-sender
      {
        display-name: display-name,
        is-public: is-public,
        show-in-leaderboards: show-in-leaderboards,
        favorite-category: favorite-category,
        join-date: (match (map-get? user-profiles tx-sender)
                     existing (get join-date existing)
                     block-height
                   ),
        bio: bio
      }
    )
    
    (print {
      action: "profile-updated",
      user: tx-sender,
      display-name: display-name,
      is-public: is-public
    })
    
    (ok true)
  )
)

;; Core leaderboard functions

;; Update user statistics (called by other contracts or users)
(define-public (update-user-stats
    (user principal)
    (tasks-completed uint)
    (rewards-earned uint)
    (current-streak uint)
    (longest-streak uint)
    (badges-count uint)
    (level uint)
  )
  (let 
    (
      (current-date (get-current-date))
      (existing-stats (default-to
        {
          total-tasks-completed: u0,
          total-rewards-earned: u0,
          current-streak: u0,
          longest-streak: u0,
          total-badges: u0,
          level: u1,
          last-updated: u0,
          overall-score: u0,
          weekly-tasks: u0,
          monthly-tasks: u0
        }
        (map-get? user-stats user)
      ))
    )
    (begin
      (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
      (asserts! (is-standard user) ERR_INVALID_USER)
      
      ;; Calculate overall score (weighted combination of metrics)
      (let 
        (
          (score (+ 
            (* tasks-completed u10) ;; 10 points per task
            (/ rewards-earned u100000) ;; 1 point per 0.1 ACHIV
            (* current-streak u50) ;; 50 points per streak day
            (* badges-count u200) ;; 200 points per badge
            (* level u1000) ;; 1000 points per level
          ))
        )
        (begin
          ;; Update user stats
          (map-set user-stats user
            {
              total-tasks-completed: tasks-completed,
              total-rewards-earned: rewards-earned,
              current-streak: current-streak,
              longest-streak: longest-streak,
              total-badges: badges-count,
              level: level,
              last-updated: block-height,
              overall-score: score,
              weekly-tasks: (get weekly-tasks existing-stats), ;; Updated separately
              monthly-tasks: (get monthly-tasks existing-stats)
            }
          )
          
          ;; Update period stats
          (try! (update-period-stats user current-date))
          
          ;; Reward user for updating stats
          (try! (contract-call? (var-get achiv-token-contract) mint-reward 
                LEADERBOARD_UPDATE_REWARD user))
          
          ;; Update global counter
          (var-set total-leaderboard-updates (+ (var-get total-leaderboard-updates) u1))
          
          (print {
            action: "user-stats-updated",
            user: user,
            overall-score: score,
            tasks: tasks-completed,
            streak: current-streak,
            level: level
          })
          
          (ok score)
        )
      )
    )
  )
)

;; Update leaderboard rankings
(define-public (update-leaderboard (category uint) (timeframe uint))
  (begin
    (asserts! (not (var-get contract-paused)) ERR_CONTRACT_PAUSED)
    (asserts! (and (>= category u1) (<= category u5)) ERR_INVALID_CATEGORY)
    (asserts! (and (>= timeframe u1) (<= timeframe u4)) ERR_INVALID_TIMEFRAME)
    
    ;; In a full implementation, this would:
    ;; 1. Query all user stats
    ;; 2. Sort by the relevant metric for the category
    ;; 3. Update leaderboard-entries map with top users
    ;; 4. Handle ties appropriately
    
    ;; For now, we'll simulate updating the leaderboard
    (var-set last-global-update block-height)
    
    (print {
      action: "leaderboard-updated",
      category: category,
      timeframe: timeframe,
      updated-by: tx-sender,
      block-height: block-height
    })
    
    (ok true)
  )
)

;; Helper functions

;; Get current date (same logic as other contracts)
(define-read-only (get-current-date)
  (/ block-height u144) ;; Assuming ~144 blocks per day
)

;; Get current week
(define-read-only (get-current-week)
  (/ (get-current-date) u7)
)

;; Get current month (simplified)
(define-read-only (get-current-month)
  (/ (get-current-date) u30)
)

;; Update period statistics
(define-private (update-period-stats (user principal) (current-date uint))
  (let 
    (
      (current-week (get-current-week))
      (current-month (get-current-month))
      (user-data (unwrap! (map-get? user-stats user) ERR_USER_NOT_FOUND))
    )
    (begin
      ;; Update weekly stats
      (let 
        (
          (weekly-stats (default-to
            { tasks-completed: u0, rewards-earned: u0, streak-days: u0, badges-earned: u0, score: u0 }
            (map-get? user-period-stats { user: user, period-type: TIMEFRAME_WEEKLY, period-id: current-week })
          ))
        )
        (map-set user-period-stats
          { user: user, period-type: TIMEFRAME_WEEKLY, period-id: current-week }
          (merge weekly-stats {
            tasks-completed: (get total-tasks-completed user-data),
            rewards-earned: (get total-rewards-earned user-data),
            streak-days: (get current-streak user-data),
            score: (get overall-score user-data)
          })
        )
      )
      
      ;; Update monthly stats
      (let 
        (
          (monthly-stats (default-to
            { tasks-completed: u0, rewards-earned: u0, streak-days: u0, badges-earned: u0, score: u0 }
            (map-get? user-period-stats { user: user, period-type: TIMEFRAME_MONTHLY, period-id: current-month })
          ))
        )
        (map-set user-period-stats
          { user: user, period-type: TIMEFRAME_MONTHLY, period-id: current-month }
          (merge monthly-stats {
            tasks-completed: (get total-tasks-completed user-data),
            rewards-earned: (get total-rewards-earned user-data),
            streak-days: (get current-streak user-data),
            score: (get overall-score user-data)
          })
        )
      )
      
      (ok true)
    )
  )
)

;; Read-only functions

;; Get user statistics
(define-read-only (get-user-stats (user principal))
  (map-get? user-stats user)
)

;; Get user profile
(define-read-only (get-user-profile (user principal))
  (map-get? user-profiles user)
)

;; Get leaderboard entry
(define-read-only (get-leaderboard-entry (category uint) (timeframe uint) (rank uint))
  (map-get? leaderboard-entries { category: category, timeframe: timeframe, rank: rank })
)

;; Get user's rank in category (simplified)
(define-read-only (get-user-rank (user principal) (category uint) (timeframe uint))
  ;; In full implementation, would search through leaderboard entries
  ;; For now, return mock data based on user stats
  (match (map-get? user-stats user)
    user-data
      (let ((score (get overall-score user-data)))
        (if (> score u10000) u1  ;; Top tier
          (if (> score u5000) u5   ;; High tier
            (if (> score u1000) u25  ;; Mid tier
              u50                     ;; Lower tier
            )
          )
        )
      )
    u999 ;; Not ranked
  )
)

;; Get period statistics
(define-read-only (get-user-period-stats (user principal) (period-type uint) (period-id uint))
  (map-get? user-period-stats { user: user, period-type: period-type, period-id: period-id })
)

;; Get global statistics
(define-read-only (get-global-stats (stat-type uint))
  (map-get? global-stats stat-type)
)

;; Get top performers (simplified)
(define-read-only (get-top-performers (category uint) (timeframe uint) (limit uint))
  ;; In full implementation, would return list of top users
  ;; For now, return summary stats
  {
    category: category,
    timeframe: timeframe,
    total-participants: (var-get total-leaderboard-updates),
    last-updated: (var-get last-global-update)
  }
)

;; Social features

;; Compare two users
(define-read-only (compare-users (user1 principal) (user2 principal))
  (let 
    (
      (stats1 (map-get? user-stats user1))
      (stats2 (map-get? user-stats user2))
    )
    (match stats1
      data1
        (match stats2
          data2
            {
              user1: user1,
              user2: user2,
              user1-score: (get overall-score data1),
              user2-score: (get overall-score data2),
              user1-tasks: (get total-tasks-completed data1),
              user2-tasks: (get total-tasks-completed data2),
              user1-streak: (get current-streak data1),
              user2-streak: (get current-streak data2),
              winner: (if (> (get overall-score data1) (get overall-score data2)) user1 user2)
            }
          { error: "user2-not-found" }
        )
      { error: "user1-not-found" }
    )
  )
)

;; Get user achievements summary
(define-read-only (get-user-achievements (user principal))
  (match (map-get? user-stats user)
    stats
      {
        user: user,
        level: (get level stats),
        total-tasks: (get total-tasks-completed stats),
        current-streak: (get current-streak stats),
        longest-streak: (get longest-streak stats),
        total-badges: (get total-badges stats),
        overall-score: (get overall-score stats),
        rank-estimate: (get-user-rank user CATEGORY_OVERALL TIMEFRAME_ALL_TIME)
      }
    { error: "user-not-found" }
  )
)

;; Check if user is in top percentage
(define-read-only (is-top-performer (user principal) (percentage uint))
  (let 
    (
      (user-rank (get-user-rank user CATEGORY_OVERALL TIMEFRAME_ALL_TIME))
      (total-users (var-get total-leaderboard-updates))
      (top-threshold (/ (* total-users percentage) u100))
    )
    (<= user-rank top-threshold)
  )
)

;; Get contract statistics
(define-read-only (get-contract-stats)
  {
    total-updates: (var-get total-leaderboard-updates),
    last-global-update: (var-get last-global-update),
    contract-paused: (var-get contract-paused)
  }
)

;; Admin function to manually update global stats
(define-public (update-global-stats)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    
    ;; Update all-time global stats
    (map-set global-stats TIMEFRAME_ALL_TIME
      {
        total-active-users: (var-get total-leaderboard-updates),
        total-tasks-completed: u0, ;; Would aggregate from all users
        total-rewards-distributed: u0, ;; Would get from token contract
        average-streak: u0, ;; Would calculate from all users
        top-performer: none, ;; Would determine from leaderboard
        last-updated: block-height
      }
    )
    
    (print {
      action: "global-stats-updated",
      admin: tx-sender,
      block-height: block-height
    })
    
    (ok true)
  )
)
