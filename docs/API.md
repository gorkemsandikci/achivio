# Achivio API Reference

This document provides a comprehensive API reference for all Achivio smart contracts.

## Contract Addresses

### Testnet
```
achiv-token: ST1234...YOUR_ADDRESS.achiv-token
task-tracker: ST1234...YOUR_ADDRESS.task-tracker
streak-system: ST1234...YOUR_ADDRESS.streak-system
nft-badges: ST1234...YOUR_ADDRESS.nft-badges
room-items: ST1234...YOUR_ADDRESS.room-items
leaderboard: ST1234...YOUR_ADDRESS.leaderboard
```

### Mainnet
```
achiv-token: SP1234...YOUR_ADDRESS.achiv-token
task-tracker: SP1234...YOUR_ADDRESS.task-tracker
streak-system: SP1234...YOUR_ADDRESS.streak-system
nft-badges: SP1234...YOUR_ADDRESS.nft-badges
room-items: SP1234...YOUR_ADDRESS.room-items
leaderboard: SP1234...YOUR_ADDRESS.leaderboard
```

## ACHIV Token Contract

### Read-Only Functions

#### `get-balance(who: principal) -> (response uint uint)`
Get the ACHIV token balance for a specific principal.

**Parameters:**
- `who`: Principal to check balance for

**Returns:**
- Success: `(ok balance)` where balance is in micro-ACHIV (1 ACHIV = 1,000,000 micro-ACHIV)
- Error: Not applicable (always succeeds)

**Example:**
```typescript
const balance = await callReadOnlyFunction({
  contractAddress: 'ST1234...',
  contractName: 'achiv-token',
  functionName: 'get-balance',
  functionArgs: [principalCV('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')],
  network
});
```

#### `get-total-supply() -> (response uint uint)`
Get the total supply of ACHIV tokens in circulation.

**Returns:**
- Success: `(ok total-supply)` in micro-ACHIV

#### `get-name() -> (response (string-ascii 20) uint)`
Get the human-readable token name.

**Returns:**
- Success: `(ok "Achivio Token")`

#### `get-symbol() -> (response (string-ascii 10) uint)`
Get the token symbol/ticker.

**Returns:**
- Success: `(ok "ACHIV")`

#### `get-decimals() -> (response uint uint)`
Get the number of decimal places for the token.

**Returns:**
- Success: `(ok u6)`

#### `get-token-uri() -> (response (optional (string-utf8 256)) uint)`
Get the token metadata URI.

**Returns:**
- Success: `(ok (some "https://achivio.app/token-metadata"))`

#### `is-authorized-minter(minter: principal) -> bool`
Check if a principal is authorized to mint tokens.

**Parameters:**
- `minter`: Principal to check authorization for

**Returns:**
- `true` if authorized, `false` otherwise

#### `is-paused() -> bool`
Check if the contract is currently paused.

**Returns:**
- `true` if paused, `false` otherwise

#### `get-total-rewards-distributed() -> uint`
Get the total amount of ACHIV tokens distributed as rewards.

**Returns:**
- Total rewards in micro-ACHIV

### Public Functions

#### `mint-reward(amount: uint, recipient: principal) -> (response uint uint)`
Mint ACHIV tokens as rewards (authorized minters only).

**Parameters:**
- `amount`: Amount to mint in micro-ACHIV
- `recipient`: Principal to receive the tokens

**Returns:**
- Success: `(ok amount)`
- Error: Various error codes (see error reference)

**Access:** Authorized minters only

#### `transfer(amount: uint, sender: principal, recipient: principal, memo: optional) -> (response bool uint)`
Transfer ACHIV tokens between principals.

**Parameters:**
- `amount`: Amount to transfer in micro-ACHIV
- `sender`: Principal sending tokens
- `recipient`: Principal receiving tokens
- `memo`: Optional memo buffer

**Returns:**
- Success: `(ok true)`
- Error: Various error codes

**Access:** Token owner or authorized caller

#### `burn(amount: uint, owner: principal) -> (response uint uint)`
Burn ACHIV tokens (remove from circulation).

**Parameters:**
- `amount`: Amount to burn in micro-ACHIV
- `owner`: Principal whose tokens to burn

**Returns:**
- Success: `(ok amount)`
- Error: Various error codes

**Access:** Token owner or authorized caller

## Task Tracker Contract

### Read-Only Functions

#### `get-task(task-id: uint) -> (optional task-data)`
Get details for a specific task.

**Parameters:**
- `task-id`: Unique task identifier

**Returns:**
- Task data tuple or `none` if not found

**Task Data Structure:**
```clarity
{
  creator: principal,
  title: (string-ascii 100),
  description: (string-ascii 500),
  reward-amount: uint,
  category: (string-ascii 50),
  difficulty: uint,
  is-active: bool,
  created-at: uint,
  total-completions: uint
}
```

#### `get-user-profile(user: principal) -> (optional user-profile)`
Get user statistics and profile information.

**Parameters:**
- `user`: Principal to get profile for

**Returns:**
- User profile tuple or `none` if not found

**Profile Structure:**
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

#### `is-task-completed-today(user: principal, task-id: uint) -> bool`
Check if user has completed a specific task today.

**Parameters:**
- `user`: Principal to check
- `task-id`: Task identifier

**Returns:**
- `true` if completed today, `false` otherwise

#### `get-current-date() -> uint`
Get the current date as used by the contract.

**Returns:**
- Current date (block-height / 144)

#### `calculate-user-level(tasks-completed: uint) -> uint`
Calculate user level based on tasks completed.

**Parameters:**
- `tasks-completed`: Total number of tasks completed

**Returns:**
- User level (1-6)

### Public Functions

#### `create-task(title, description, reward-amount, category, difficulty) -> (response uint uint)`
Create a new habit/task.

**Parameters:**
- `title`: Task title (max 100 chars)
- `description`: Task description (max 500 chars)
- `reward-amount`: ACHIV reward in micro-tokens
- `category`: Task category (max 50 chars)
- `difficulty`: Difficulty level (1-5)

**Returns:**
- Success: `(ok task-id)`
- Error: Various error codes

#### `complete-task(task-id: uint) -> (response uint uint)`
Complete a task and earn rewards.

**Parameters:**
- `task-id`: Task to complete

**Returns:**
- Success: `(ok reward-amount)`
- Error: Various error codes

**Side Effects:**
- Mints ACHIV tokens to user
- Updates user profile
- Records completion timestamp

## Streak System Contract

### Read-Only Functions

#### `get-user-streak(user: principal) -> (optional streak-data)`
Get user's streak information.

**Parameters:**
- `user`: Principal to check

**Returns:**
- Streak data tuple or `none`

**Streak Data Structure:**
```clarity
{
  current-streak: uint,
  longest-streak: uint,
  last-activity-date: uint,
  streak-start-date: uint,
  total-streak-rewards: uint,
  milestone-achievements: (list 10 uint)
}
```

#### `calculate-streak-bonus(streak-length: uint) -> uint`
Calculate bonus amount for a given streak length.

**Parameters:**
- `streak-length`: Number of consecutive days

**Returns:**
- Bonus amount in micro-ACHIV

#### `get-claimable-bonuses(user: principal) -> (response bonus-info uint)`
Get user's claimable streak bonuses.

**Parameters:**
- `user`: Principal to check

**Returns:**
- Bonus information including claimable amount

### Public Functions

#### `update-user-streak(user: principal, tasks-completed-today: uint) -> (response uint uint)`
Update user's streak based on daily activity.

**Parameters:**
- `user`: Principal to update
- `tasks-completed-today`: Number of tasks completed today

**Returns:**
- Success: `(ok new-streak-length)`
- Error: Various error codes

**Access:** Task tracker contract

#### `claim-streak-bonus(date: uint) -> (response uint uint)`
Claim daily streak bonus.

**Parameters:**
- `date`: Date to claim bonus for

**Returns:**
- Success: `(ok bonus-amount)`
- Error: Various error codes

## NFT Badges Contract

### Read-Only Functions

#### `get-badge-metadata(token-id: uint) -> (optional badge-metadata)`
Get metadata for a specific badge.

**Parameters:**
- `token-id`: Badge NFT token ID

**Returns:**
- Badge metadata tuple or `none`

#### `get-user-badge-collection(user: principal) -> (optional collection-data)`
Get user's badge collection summary.

**Parameters:**
- `user`: Principal to check

**Returns:**
- Collection data including total badges and rarity counts

#### `user-owns-badge-type(user: principal, badge-type: uint) -> bool`
Check if user owns a specific type of badge.

**Parameters:**
- `user`: Principal to check
- `badge-type`: Badge type identifier

**Returns:**
- `true` if user owns this badge type

### Public Functions

#### `mint-streak-badge(recipient: principal, streak-days: uint) -> (response uint uint)`
Mint a streak achievement badge.

**Parameters:**
- `recipient`: Principal to receive badge
- `streak-days`: Streak length achieved

**Returns:**
- Success: `(ok token-id)`
- Error: Various error codes

**Access:** Authorized minters

## Room Items Contract

### Read-Only Functions

#### `get-item-template(template-id: uint) -> (optional template-data)`
Get template information for purchasable items.

**Parameters:**
- `template-id`: Item template identifier

**Returns:**
- Template data including name, price, and requirements

#### `get-user-room(user: principal) -> (optional room-data)`
Get user's room information.

**Parameters:**
- `user`: Principal to check

**Returns:**
- Room data including theme and item count

#### `can-afford-item(user: principal, template-id: uint) -> bool`
Check if user can afford a specific item.

**Parameters:**
- `user`: Principal to check
- `template-id`: Item template to check

**Returns:**
- `true` if user has sufficient ACHIV tokens

### Public Functions

#### `purchase-item(template-id: uint) -> (response uint uint)`
Purchase a virtual room item.

**Parameters:**
- `template-id`: Item template to purchase

**Returns:**
- Success: `(ok item-token-id)`
- Error: Various error codes

**Side Effects:**
- Burns ACHIV tokens as payment
- Mints room item NFT
- Updates user's room

#### `place-item-in-room(item-id, position, rotation, scale) -> (response bool uint)`
Place an owned item in the user's room.

**Parameters:**
- `item-id`: Item NFT token ID
- `position`: 3D position tuple {x, y, z}
- `rotation`: 3D rotation tuple {x, y, z}
- `scale`: Scale factor (50-200)

**Returns:**
- Success: `(ok true)`
- Error: Various error codes

## Leaderboard Contract

### Read-Only Functions

#### `get-user-stats(user: principal) -> (optional user-stats)`
Get user statistics for leaderboard ranking.

**Parameters:**
- `user`: Principal to check

**Returns:**
- User statistics including overall score

#### `get-user-rank(user: principal, category: uint, timeframe: uint) -> uint`
Get user's rank in a specific category and timeframe.

**Parameters:**
- `user`: Principal to check
- `category`: Ranking category (1-5)
- `timeframe`: Time period (1-4)

**Returns:**
- User's rank (lower is better)

#### `compare-users(user1: principal, user2: principal) -> comparison-result`
Compare statistics between two users.

**Parameters:**
- `user1`: First user to compare
- `user2`: Second user to compare

**Returns:**
- Detailed comparison including winner

### Public Functions

#### `update-user-stats(user, tasks, rewards, streak, badges, level) -> (response uint uint)`
Update user statistics for leaderboard.

**Parameters:**
- `user`: Principal to update
- `tasks`: Total tasks completed
- `rewards`: Total rewards earned
- `streak`: Current streak length
- `badges`: Total badges owned
- `level`: User level

**Returns:**
- Success: `(ok overall-score)`
- Error: Various error codes

## Error Codes Reference

### Common Errors (100-199)
- `u100` - ERR_OWNER_ONLY: Function restricted to contract owner
- `u101` - ERR_NOT_TOKEN_OWNER: User doesn't own the token/asset
- `u102` - ERR_INSUFFICIENT_BALANCE: Not enough tokens for operation
- `u103` - ERR_INVALID_AMOUNT: Amount must be greater than zero
- `u104` - ERR_CONTRACT_PAUSED: Contract operations are paused
- `u105` - ERR_UNAUTHORIZED_MINTER: Not authorized to mint tokens
- `u106` - ERR_INVALID_RECIPIENT: Invalid recipient address

### Task Tracker Errors (200-299)
- `u201` - ERR_TASK_NOT_FOUND: Task ID doesn't exist
- `u202` - ERR_TASK_ALREADY_COMPLETED: Already completed today
- `u203` - ERR_INVALID_TASK_ID: Invalid task parameters
- `u204` - ERR_UNAUTHORIZED: Not authorized for this operation
- `u205` - ERR_CONTRACT_PAUSED: Contract is paused
- `u206` - ERR_INVALID_USER: Invalid user principal
- `u207` - ERR_TASK_ALREADY_EXISTS: Task already exists
- `u208` - ERR_INVALID_REWARD_AMOUNT: Invalid reward amount
- `u209` - ERR_TOKEN_CONTRACT_ERROR: Token contract call failed
- `u210` - ERR_INVALID_DATE: Invalid date parameter

### Streak System Errors (300-399)
- `u300` - ERR_OWNER_ONLY: Owner only function
- `u301` - ERR_UNAUTHORIZED: Not authorized
- `u302` - ERR_CONTRACT_PAUSED: Contract paused
- `u303` - ERR_INVALID_USER: Invalid user
- `u304` - ERR_STREAK_NOT_FOUND: No streak record found
- `u305` - ERR_NO_ACTIVITY_TODAY: No activity recorded today
- `u306` - ERR_STREAK_ALREADY_CLAIMED: Bonus already claimed
- `u307` - ERR_INSUFFICIENT_STREAK: Streak too short
- `u308` - ERR_TOKEN_CONTRACT_ERROR: Token contract error

### NFT Badges Errors (400-499)
- `u400` - ERR_OWNER_ONLY: Owner only function
- `u401` - ERR_NOT_TOKEN_OWNER: Not token owner
- `u402` - ERR_TOKEN_NOT_FOUND: Token not found
- `u403` - ERR_UNAUTHORIZED: Not authorized
- `u404` - ERR_CONTRACT_PAUSED: Contract paused
- `u405` - ERR_INVALID_USER: Invalid user
- `u406` - ERR_BADGE_ALREADY_MINTED: Badge already exists
- `u407` - ERR_INSUFFICIENT_ACHIEVEMENT: Requirements not met
- `u408` - ERR_INVALID_BADGE_TYPE: Invalid badge type
- `u409` - ERR_METADATA_FROZEN: Metadata is frozen

### Room Items Errors (500-599)
- `u500` - ERR_OWNER_ONLY: Owner only function
- `u501` - ERR_NOT_TOKEN_OWNER: Not token owner
- `u502` - ERR_TOKEN_NOT_FOUND: Token not found
- `u503` - ERR_UNAUTHORIZED: Not authorized
- `u504` - ERR_CONTRACT_PAUSED: Contract paused
- `u505` - ERR_INVALID_USER: Invalid user
- `u506` - ERR_INSUFFICIENT_FUNDS: Insufficient ACHIV tokens
- `u507` - ERR_ITEM_NOT_AVAILABLE: Item not available
- `u508` - ERR_INVALID_POSITION: Invalid room position
- `u509` - ERR_ROOM_FULL: Room at maximum capacity
- `u510` - ERR_ITEM_NOT_OWNED: User doesn't own item
- `u511` - ERR_INVALID_ITEM_TYPE: Invalid item type
- `u512` - ERR_BADGE_REQUIREMENT_NOT_MET: Required badge missing

### Leaderboard Errors (600-699)
- `u600` - ERR_OWNER_ONLY: Owner only function
- `u601` - ERR_UNAUTHORIZED: Not authorized
- `u602` - ERR_CONTRACT_PAUSED: Contract paused
- `u603` - ERR_INVALID_USER: Invalid user
- `u604` - ERR_INVALID_TIMEFRAME: Invalid timeframe
- `u605` - ERR_USER_NOT_FOUND: User not found
- `u606` - ERR_INVALID_CATEGORY: Invalid category
- `u607` - ERR_ALREADY_UPDATED_TODAY: Already updated today
- `u608` - ERR_INVALID_SCORE: Invalid score

## Usage Examples

### Complete User Workflow

```typescript
// 1. Create a habit
const createResult = await makeContractCall({
  contractAddress: 'ST1234...',
  contractName: 'task-tracker',
  functionName: 'create-task',
  functionArgs: [
    stringAsciiCV('Morning Exercise'),
    stringAsciiCV('30 minutes of cardio'),
    uintCV(2000000), // 2 ACHIV reward
    stringAsciiCV('fitness'),
    uintCV(3) // Medium difficulty
  ],
  senderKey: userPrivateKey,
  network
});

// 2. Complete the task
const completeResult = await makeContractCall({
  contractAddress: 'ST1234...',
  contractName: 'task-tracker', 
  functionName: 'complete-task',
  functionArgs: [uintCV(1)], // Task ID
  senderKey: userPrivateKey,
  network
});

// 3. Check ACHIV balance
const balance = await callReadOnlyFunction({
  contractAddress: 'ST1234...',
  contractName: 'achiv-token',
  functionName: 'get-balance',
  functionArgs: [principalCV(userAddress)],
  network
});

// 4. Purchase room item
const purchaseResult = await makeContractCall({
  contractAddress: 'ST1234...',
  contractName: 'room-items',
  functionName: 'purchase-item',
  functionArgs: [uintCV(1)], // Modern desk template
  senderKey: userPrivateKey,
  network
});
```

### Error Handling

```typescript
try {
  const result = await makeContractCall({...});
  
  if (result.error) {
    switch(result.error) {
      case 'u202':
        showMessage('Task already completed today!');
        break;
      case 'u506':
        showMessage('Insufficient ACHIV tokens!');
        break;
      default:
        showMessage('Transaction failed');
    }
  } else {
    showMessage('Success!');
  }
} catch (error) {
  console.error('Contract call failed:', error);
}
```

This API reference provides comprehensive documentation for integrating with the Achivio smart contract system.
