# Achivio Smart Contract Guide

This document provides detailed information about each smart contract in the Achivio ecosystem.

## Contract Overview

The Achivio system consists of 6 interconnected smart contracts that work together to provide a comprehensive habit tracking and reward system.

### Contract Dependencies

```
achiv-token (SIP-010 Fungible Token)
    ↓ (authorized minter)
task-tracker (Core Logic)
    ↓ (calls)
streak-system (Bonus Rewards)
    ↓ (mints badges)
nft-badges (SIP-009 NFTs)
    ↓ (unlocks items)
room-items (SIP-009 NFTs)
    ↓ (updates stats)
leaderboard (Social Features)
```

## 1. ACHIV Token Contract (`achiv-token.clar`)

### Purpose
SIP-010 compliant fungible token that serves as the main reward currency in the Achivio ecosystem.

### Key Features
- **Mintable**: Only authorized contracts can mint new tokens
- **Burnable**: Deflationary mechanism through room item purchases
- **Pausable**: Emergency stop functionality
- **Secure**: Comprehensive access controls and validation

### Constants
```clarity
(define-constant BASE_REWARD_AMOUNT u1000000)      ;; 1 ACHIV base reward
(define-constant STREAK_BONUS_MULTIPLIER u500000)  ;; 0.5 ACHIV bonus per streak day
```

### Key Functions

#### `mint-reward(amount: uint, recipient: principal)`
- **Purpose**: Mint ACHIV tokens as rewards for task completion
- **Access**: Authorized minters only (task-tracker, streak-system)
- **Validation**: Non-zero amount, valid recipient, contract not paused
- **Events**: Emits mint event with reward details

#### `transfer(amount: uint, sender: principal, recipient: principal, memo: optional)`
- **Purpose**: Transfer ACHIV tokens between users
- **Access**: Token owner or authorized caller
- **Validation**: Sufficient balance, valid addresses, contract not paused
- **Events**: Emits transfer event

#### `burn(amount: uint, owner: principal)`
- **Purpose**: Remove tokens from circulation (deflationary)
- **Access**: Token owner or authorized caller
- **Use Case**: Room item purchases, premium features
- **Events**: Emits burn event

### Security Features
- Authorized minter system prevents unauthorized token creation
- Pause mechanism allows emergency stops
- Balance checks prevent overdrafts
- Input validation on all parameters

## 2. Task Tracker Contract (`task-tracker.clar`)

### Purpose
Core contract that manages habit creation, tracking, and completion rewards.

### Key Features
- **Task Management**: Create, deactivate, and track habits
- **Completion Tracking**: Prevent double rewards per day
- **User Profiles**: Track progress, levels, and statistics
- **Reward Distribution**: Automatic ACHIV token minting

### Data Structures

#### Task Definition
```clarity
{
  creator: principal,
  title: (string-ascii 100),
  description: (string-ascii 500),
  reward-amount: uint,
  category: (string-ascii 50),
  difficulty: uint,           ;; 1-5 scale
  is-active: bool,
  created-at: uint,
  total-completions: uint
}
```

#### User Profile
```clarity
{
  total-tasks-completed: uint,
  total-rewards-earned: uint,
  current-streak: uint,
  longest-streak: uint,
  level: uint,
  joined-at: uint,
  last-activity: uint
}
```

### Key Functions

#### `create-task(title, description, reward-amount, category, difficulty)`
- **Purpose**: Create a new habit/task for completion
- **Access**: Any user
- **Validation**: Valid difficulty (1-5), positive reward, contract not paused
- **Returns**: New task ID

#### `complete-task(task-id: uint)`
- **Purpose**: Complete a task and earn ACHIV rewards
- **Access**: Any user
- **Validation**: Task exists, not completed today, task is active
- **Side Effects**: Mints ACHIV tokens, updates user profile, records completion
- **Anti-Fraud**: One completion per user per task per day

#### `deactivate-task(task-id: uint)`
- **Purpose**: Disable a task from further completions
- **Access**: Task creator or contract owner
- **Use Case**: Discontinuing old habits or removing inappropriate tasks

### Level System
Users gain levels based on total tasks completed:
- Level 1: 0-10 tasks
- Level 2: 11-25 tasks  
- Level 3: 26-50 tasks
- Level 4: 51-100 tasks
- Level 5: 101-250 tasks
- Level 6: 251+ tasks

## 3. Streak System Contract (`streak-system.clar`)

### Purpose
Manages consecutive day tracking and provides bonus rewards for consistency.

### Key Features
- **Streak Tracking**: Monitors consecutive completion days
- **Bonus Rewards**: Additional ACHIV tokens for streaks
- **Milestone Achievements**: Triggers NFT badge creation
- **Multiplier System**: Increasing bonuses for longer streaks

### Streak Mechanics

#### Bonus Calculation
```clarity
(define-read-only (calculate-streak-bonus (streak-length uint))
  (let 
    (
      (base-bonus STREAK_BONUS_BASE)           ;; 0.5 ACHIV
      (multiplier (min (/ streak-length u7) u10)) ;; Max 10x multiplier
    )
    (min (* base-bonus multiplier) MAX_STREAK_BONUS) ;; Cap at 5 ACHIV
  )
)
```

#### Milestone Rewards
- **7 days**: "Week Warrior" badge + 2 ACHIV bonus
- **14 days**: "Fortnight Fighter" badge + 5 ACHIV bonus
- **30 days**: "Monthly Master" badge + 12 ACHIV bonus
- **60 days**: "Bimonthly Beast" badge + 25 ACHIV bonus
- **100 days**: "Centurion Champion" badge + 50 ACHIV bonus
- **365 days**: "Annual Achiever" badge + 100 ACHIV bonus

### Key Functions

#### `update-user-streak(user: principal, tasks-completed-today: uint)`
- **Purpose**: Update user's streak based on daily activity
- **Access**: Task tracker contract
- **Logic**: Continue streak if completed yesterday, reset if gap, start new if first day
- **Side Effects**: May trigger milestone badge minting

#### `claim-streak-bonus(date: uint)`
- **Purpose**: Claim daily streak bonus rewards
- **Access**: Any user with unclaimed bonus
- **Validation**: Bonus exists and not already claimed
- **Rewards**: Mints calculated bonus ACHIV tokens

## 4. NFT Badges Contract (`nft-badges.clar`)

### Purpose
SIP-009 compliant NFT contract for achievement badges and milestones.

### Badge Types
1. **Streak Master** - Consecutive day achievements
2. **Task Master** - High task completion counts
3. **Category Expert** - Mastery in specific categories
4. **Level Champion** - User level milestones
5. **Special Event** - Limited edition occasions

### Badge Rarity System
- **Common**: Basic achievements (green background)
- **Rare**: Moderate milestones (blue background)
- **Epic**: Significant achievements (purple background)
- **Legendary**: Extraordinary accomplishments (gold background)

### Key Functions

#### `mint-achievement-badge(recipient, badge-type, title, description, milestone, category, rarity)`
- **Purpose**: Create new achievement badge NFT
- **Access**: Authorized minters (streak-system, admin)
- **Metadata**: Stores achievement details and rarity
- **Returns**: New token ID

#### `mint-streak-badge(recipient: principal, streak-days: uint)`
- **Purpose**: Mint badge for streak milestones
- **Access**: Streak system contract
- **Auto-Rarity**: Determines rarity based on streak length

## 5. Room Items Contract (`room-items.clar`)

### Purpose
SIP-009 NFT contract for virtual 3D room furniture and decorations.

### Item Categories
1. **Furniture** - Desks, chairs, shelves
2. **Decoration** - Posters, art, plants
3. **Tech** - Monitors, computers, gadgets
4. **Plants** - Various greenery options
5. **Lighting** - Lamps, RGB effects
6. **Special** - Badge-locked exclusive items

### Room System

#### 3D Positioning
Items can be placed with precise positioning:
```clarity
{
  position: { x: uint, y: uint, z: uint },    ;; 3D coordinates
  rotation: { x: uint, y: uint, z: uint },    ;; Rotation in degrees
  scale: uint,                                ;; Size multiplier (50-200%)
  is-placed: bool,
  placed-at: uint
}
```

#### Room Customization
- **Themes**: Cyberpunk, minimalist, cozy, professional
- **Background Music**: Ambient, focus, energetic tracks
- **Lighting**: Adjustable ambient lighting
- **Layout**: Free-form item placement within bounds

### Key Functions

#### `purchase-item(template-id: uint)`
- **Purpose**: Buy virtual furniture with ACHIV tokens
- **Payment**: Burns ACHIV tokens (deflationary)
- **Validation**: Sufficient balance, item available, badge requirements met
- **Returns**: New item NFT token ID

#### `place-item-in-room(item-id, position, rotation, scale)`
- **Purpose**: Position item in user's 3D room
- **Access**: Item owner only
- **Validation**: Valid coordinates, reasonable scale, room not full
- **Limits**: Maximum 50 items per room

## 6. Leaderboard Contract (`leaderboard.clar`)

### Purpose
Social features including user rankings, statistics, and comparisons.

### Ranking Categories
1. **Overall Score** - Composite ranking
2. **Streak Length** - Current consecutive days
3. **Tasks Completed** - Total task count
4. **Rewards Earned** - Total ACHIV earned
5. **Badges Collected** - NFT achievement count

### Scoring System
```clarity
(+ 
  (* tasks-completed u10)     ;; 10 points per task
  (/ rewards-earned u100000)  ;; 1 point per 0.1 ACHIV
  (* current-streak u50)      ;; 50 points per streak day
  (* badges-count u200)       ;; 200 points per badge
  (* level u1000)             ;; 1000 points per level
)
```

### Key Functions

#### `update-user-stats(user, tasks, rewards, streak, badges, level)`
- **Purpose**: Update user statistics for leaderboard calculation
- **Access**: Any user (with validation)
- **Rewards**: Small ACHIV bonus for updating stats
- **Side Effects**: Recalculates overall score and rankings

#### `compare-users(user1: principal, user2: principal)`
- **Purpose**: Direct comparison between two users
- **Returns**: Detailed comparison including winner determination
- **Use Case**: Friend challenges and social features

## Error Codes

### Common Error Codes
- `u100` - ERR_OWNER_ONLY: Function restricted to contract owner
- `u101` - ERR_NOT_TOKEN_OWNER: User doesn't own the token/asset
- `u102` - ERR_INSUFFICIENT_BALANCE: Not enough tokens for operation
- `u103` - ERR_INVALID_AMOUNT: Amount must be greater than zero
- `u104` - ERR_CONTRACT_PAUSED: Contract operations are paused

### Contract-Specific Error Codes

#### Task Tracker (200-299)
- `u201` - ERR_TASK_NOT_FOUND: Task ID doesn't exist
- `u202` - ERR_TASK_ALREADY_COMPLETED: Already completed today
- `u203` - ERR_INVALID_TASK_ID: Invalid task parameters
- `u208` - ERR_INVALID_REWARD_AMOUNT: Reward must be positive

#### Streak System (300-399)
- `u304` - ERR_STREAK_NOT_FOUND: User has no streak record
- `u306` - ERR_STREAK_ALREADY_CLAIMED: Bonus already claimed
- `u307` - ERR_INSUFFICIENT_STREAK: Streak too short for milestone

#### NFT Badges (400-499)
- `u406` - ERR_BADGE_ALREADY_MINTED: Badge already exists
- `u407` - ERR_INSUFFICIENT_ACHIEVEMENT: Requirements not met

#### Room Items (500-599)
- `u506` - ERR_INSUFFICIENT_FUNDS: Not enough ACHIV tokens
- `u508` - ERR_INVALID_POSITION: Position outside room bounds
- `u509` - ERR_ROOM_FULL: Maximum items reached
- `u512` - ERR_BADGE_REQUIREMENT_NOT_MET: Required badge missing

#### Leaderboard (600-699)
- `u605` - ERR_USER_NOT_FOUND: User has no statistics
- `u607` - ERR_ALREADY_UPDATED_TODAY: Stats already updated today

## Best Practices

### For Developers
1. **Always check return values** from contract calls
2. **Handle error codes appropriately** in UI
3. **Validate inputs** before making contract calls
4. **Use read-only functions** for data queries
5. **Batch operations** when possible to save on fees

### For Users
1. **Complete tasks daily** to maintain streaks
2. **Claim streak bonuses** regularly to avoid missing rewards
3. **Plan room purchases** based on available ACHIV balance
4. **Update leaderboard stats** periodically for accurate rankings
5. **Check badge requirements** before expecting milestone rewards

## Integration Examples

### Frontend Integration
```typescript
// Complete a task and handle results
const completeTask = async (taskId: number) => {
  try {
    const result = await makeContractCall({
      contractAddress: 'SP...',
      contractName: 'task-tracker',
      functionName: 'complete-task',
      functionArgs: [uintCV(taskId)],
      senderKey: userPrivateKey,
      network: network
    });
    
    if (result.error) {
      if (result.error.includes('u202')) {
        showMessage('Task already completed today!');
      } else if (result.error.includes('u201')) {
        showMessage('Task not found!');
      }
    } else {
      showRewardAnimation(result.reward);
      updateUserBalance();
    }
  } catch (error) {
    console.error('Task completion failed:', error);
  }
};
```

This comprehensive guide covers all major aspects of the Achivio smart contract system. For specific implementation details, refer to the contract source code and test files.
