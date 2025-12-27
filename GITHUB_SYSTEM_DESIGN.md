# GitHub System Design Architecture

## Table of Contents
1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Core Components](#core-components)
4. [Data Models](#data-models)
5. [Storage Architecture](#storage-architecture)
6. [API Design](#api-design)
7. [Scalability & Performance](#scalability--performance)
8. [Security Architecture](#security-architecture)
9. [Deployment & Infrastructure](#deployment--infrastructure)
10. [Key Algorithms & Data Structures](#key-algorithms--data-structures)
11. [Real-Time Features](#real-time-features)
12. [Search Architecture](#search-architecture)
13. [Notifications System](#notifications-system)
14. [CI/CD Integration](#cicd-integration)

---

## Overview

### System Requirements

**Functional Requirements:**
- Version control (Git operations: clone, push, pull, merge, branch)
- Repository management (create, delete, fork, star)
- Issue tracking and project management
- Pull request workflow (create, review, merge)
- Code search and navigation
- User authentication and authorization
- Social features (follow, star, watch)
- Real-time collaboration (comments, reviews)
- Webhooks and integrations
- CI/CD pipeline integration

**Non-Functional Requirements:**
- **Scalability**: Handle 100M+ repositories, 50M+ users
- **Availability**: 99.9% uptime (8.76 hours downtime/year)
- **Performance**: 
  - API response time < 200ms (p95)
  - Git operations < 5s for typical repos
  - Search results < 500ms
- **Consistency**: Strong consistency for critical operations (commits, merges)
- **Durability**: Zero data loss for repositories
- **Security**: End-to-end encryption, access control, audit logs

### Scale Estimates

- **Users**: 50M+ active users
- **Repositories**: 100M+ repositories
- **Daily Commits**: 100M+ commits/day
- **API Requests**: 1B+ requests/day
- **Storage**: 100+ PB of code and metadata
- **Traffic**: 10+ TB/day data transfer

---

## High-Level Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  Web UI  │  Mobile Apps  │  Desktop Apps  │  CLI  │  API Clients │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer / CDN                         │
│                    (CloudFlare / AWS ELB)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ REST API     │  │ GraphQL API  │  │ Git Protocol │          │
│  │ (Rails)      │  │ (GraphQL)    │  │ (SSH/HTTPS)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Service Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Repo     │  │ Issues   │  │ PR       │  │ Search   │        │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Auth     │  │ Notify   │  │ Webhook  │  │ CI/CD    │        │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ MySQL        │  │ Redis        │  │ Elasticsearch│          │
│  │ (Metadata)   │  │ (Cache)      │  │ (Search)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Git Storage  │  │ Blob Storage │  │ Message Queue │          │
│  │ (File Sys)   │  │ (S3/GCS)     │  │ (Kafka/Rabbit)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Microservices Architecture**: Services are loosely coupled and independently deployable
2. **Event-Driven**: Asynchronous processing for non-critical operations
3. **Caching Strategy**: Multi-layer caching (CDN → Application → Database)
4. **Database Sharding**: Horizontal partitioning by user/repository
5. **Read Replicas**: Separate read/write paths for scalability
6. **Eventual Consistency**: Acceptable for social features (stars, follows)

---

## Core Components

### 1. Repository Service

**Responsibilities:**
- Repository CRUD operations
- Git operations (clone, push, pull)
- Branch and tag management
- Fork operations
- Repository settings

**Key Operations:**
```
create_repository(user_id, name, visibility)
delete_repository(repo_id)
fork_repository(source_repo_id, target_user_id)
clone_repository(repo_id, protocol)
push_commits(repo_id, branch, commits)
pull_commits(repo_id, branch, ref)
create_branch(repo_id, branch_name, from_ref)
merge_branch(repo_id, source_branch, target_branch)
```

**Storage:**
- **Metadata**: MySQL (repository info, settings, permissions)
- **Git Objects**: File system (packed refs, objects, config)
- **Large Files**: Git LFS → Object Storage (S3/GCS)

**Scalability:**
- Shard repositories by `user_id` or `organization_id`
- Use consistent hashing for repository distribution
- Separate storage nodes for different repository sizes

### 2. Git Protocol Handler

**Protocols Supported:**
- **HTTPS**: Standard HTTP with authentication
- **SSH**: Secure shell protocol
- **Git Protocol**: Unencrypted (deprecated)

**Components:**
```
┌─────────────────────────────────────────┐
│         Git Protocol Handler             │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ HTTPS    │  │ SSH      │            │
│  │ Handler  │  │ Handler  │            │
│  └──────────┘  └──────────┘            │
│         │              │                │
│         └──────┬───────┘                │
│                ▼                        │
│         Git Command Router               │
│  ┌──────────────────────────────┐        │
│  │ upload-pack (fetch/clone)   │        │
│  │ receive-pack (push)          │        │
│  │ info-refs (list refs)        │        │
│  └──────────────────────────────┘        │
└─────────────────────────────────────────┘
```

**Git Operations Flow:**

**Push Operation:**
```
1. Client: git push origin main
2. SSH/HTTPS Handler: Authenticate user
3. Git Command Router: Route to receive-pack
4. Receive Pack:
   - Validate permissions (write access)
   - Receive packfile
   - Unpack objects
   - Validate refs (pre-receive hooks)
   - Update refs
   - Trigger post-receive hooks
5. Update Repository Metadata
6. Trigger Webhooks
7. Update Search Index (async)
```

**Pull/Clone Operation:**
```
1. Client: git pull origin main
2. SSH/HTTPS Handler: Authenticate user
3. Git Command Router: Route to upload-pack
4. Upload Pack:
   - Check read permissions
   - Determine objects to send (negotiation)
   - Create packfile
   - Stream packfile to client
5. Log access (analytics)
```

### 3. Pull Request Service

**Responsibilities:**
- PR creation and management
- Code review workflow
- Merge operations
- Conflict detection and resolution
- PR status checks (CI integration)

**Data Model:**
```python
PullRequest {
    id: UUID
    repository_id: UUID
    number: int (sequential per repo)
    title: string
    description: text
    author_id: UUID
    base_branch: string
    head_branch: string
    head_repo_id: UUID (for forks)
    status: OPEN | CLOSED | MERGED
    mergeable: boolean
    merge_status: CLEAN | CONFLICT | BLOCKED
    created_at: timestamp
    updated_at: timestamp
    merged_at: timestamp | null
    merge_commit_sha: string | null
}

PRReview {
    id: UUID
    pr_id: UUID
    reviewer_id: UUID
    state: APPROVED | CHANGES_REQUESTED | COMMENTED
    body: text
    submitted_at: timestamp
}

PRComment {
    id: UUID
    pr_id: UUID
    author_id: UUID
    body: text
    path: string (file path)
    line: int (line number)
    position: int (diff position)
    created_at: timestamp
}
```

**Merge Operation Flow:**
```
1. User clicks "Merge Pull Request"
2. Validate merge requirements:
   - Required reviews approved
   - CI checks passing
   - No conflicts
   - Branch protection rules satisfied
3. Create merge commit:
   - Checkout base branch
   - Merge head branch (3-way merge)
   - Resolve conflicts if any
   - Create merge commit
4. Update base branch ref
5. Close PR
6. Trigger webhooks
7. Update search index
8. Notify participants
```

**Conflict Detection:**
- Pre-merge: Compare base and head commit trees
- Use Git's merge algorithm (3-way merge)
- Detect conflicts at file level
- Mark PR as "has conflicts" if detected

### 4. Issues & Project Management

**Components:**
- Issues (bug reports, feature requests)
- Milestones
- Labels
- Projects (Kanban boards)
- Assignees

**Data Model:**
```python
Issue {
    id: UUID
    repository_id: UUID
    number: int
    title: string
    body: text
    author_id: UUID
    state: OPEN | CLOSED
    labels: [Label]
    assignees: [User]
    milestone_id: UUID | null
    created_at: timestamp
    closed_at: timestamp | null
}

Comment {
    id: UUID
    issue_id: UUID
    author_id: UUID
    body: text
    created_at: timestamp
    updated_at: timestamp
}
```

**Features:**
- Issue templates
- Issue linking (closes #123)
- Reactions (👍, ❤️, etc.)
- Mentions (@username)
- Auto-closing via commits

### 5. Authentication & Authorization

**Authentication Methods:**
- Username/Password
- OAuth 2.0
- Personal Access Tokens (PAT)
- SSH Keys
- GitHub Apps
- SAML SSO (Enterprise)

**Authorization Model:**
```
Permissions Hierarchy:
- Owner (full control)
  - Admin (manage settings, delete repo)
    - Write (push, create branches)
      - Read (clone, pull)
        - No access
```

**Access Control:**
- Repository-level permissions
- Organization-level permissions
- Team-based permissions
- Branch protection rules

**Token Management:**
- Personal Access Tokens (scoped permissions)
- OAuth tokens (for third-party apps)
- Token rotation and expiration
- Rate limiting per token

### 6. Search Service

**Search Types:**
- Code search (full-text)
- Repository search
- User search
- Issue/PR search

**Architecture:**
```
┌─────────────────────────────────────────┐
│         Search Query                     │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Query Parser & Router              │
│  (determine search type: code/repo/etc) │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Elasticsearch │    │ MySQL      │
│ (Code/Text)   │    │ (Metadata) │
└──────────────┘    └──────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────────┐
│      Result Aggregation & Ranking       │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Formatted Results                │
└─────────────────────────────────────────┘
```

**Indexing Strategy:**
- **Code Indexing**: 
  - Parse files (extract language, structure)
  - Index tokens, symbols, file paths
  - Update on push (async)
- **Repository Indexing**:
  - Index name, description, topics, README
  - Update on repository changes
- **User Indexing**:
  - Index username, name, bio
  - Update on profile changes

**Search Features:**
- Syntax highlighting
- Language-specific search
- File path filtering
- Symbol search (functions, classes)
- Regex support

---

## Data Models

### Core Entities

#### User
```python
User {
    id: UUID (primary key)
    username: string (unique, indexed)
    email: string (unique, indexed)
    name: string
    avatar_url: string
    bio: text
    location: string
    company: string
    blog: string
    public_repos: int
    followers_count: int
    following_count: int
    created_at: timestamp
    updated_at: timestamp
    deleted_at: timestamp | null
}
```

#### Repository
```python
Repository {
    id: UUID (primary key)
    owner_id: UUID (foreign key → User/Organization)
    name: string
    full_name: string (owner/name, unique, indexed)
    description: text
    visibility: PUBLIC | PRIVATE
    default_branch: string
    language: string (primary language)
    languages: JSON (language breakdown)
    topics: [string]
    stars_count: int
    forks_count: int
    watchers_count: int
    open_issues_count: int
    size: bigint (bytes)
    created_at: timestamp
    updated_at: timestamp
    pushed_at: timestamp
    archived: boolean
    disabled: boolean
}
```

#### Commit
```python
Commit {
    sha: string (40-char SHA-1, primary key)
    repository_id: UUID (foreign key)
    author_id: UUID (foreign key → User)
    committer_id: UUID (foreign key → User)
    message: text
    tree_sha: string
    parent_shas: [string]
    created_at: timestamp
}
```

#### Branch
```python
Branch {
    repository_id: UUID (foreign key)
    name: string
    commit_sha: string
    protected: boolean
    protection_rules: JSON
    updated_at: timestamp
    PRIMARY KEY (repository_id, name)
}
```

### Relationships

```
User 1───N Repository (owner)
User N───N Repository (collaborator)
Repository 1───N Branch
Repository 1───N Commit
Repository 1───N PullRequest
Repository 1───N Issue
Repository N───N User (stargazers)
Repository N───N User (watchers)
PullRequest N───1 Repository
PullRequest N───N User (reviewers)
Issue N───1 Repository
Issue N───N User (assignees)
```

---

## Storage Architecture

### 1. Relational Database (MySQL)

**Purpose:** Metadata, relationships, transactional data

**Sharding Strategy:**
- **User Sharding**: Shard by `user_id` (consistent hashing)
- **Repository Sharding**: Shard by `owner_id` (user or org)
- **Cross-shard Queries**: Use federation or read replicas

**Schema Design:**
```
Shard 1 (users 0-25M)
Shard 2 (users 25M-50M)
Shard 3 (users 50M-75M)
Shard 4 (users 75M-100M)
```

**Replication:**
- Master-Slave replication
- Read replicas for query distribution
- Write to master, read from replicas (with eventual consistency)

### 2. Git Object Storage

**Storage Format:**
```
/repositories/
  └── {owner}/
      └── {repo_name}.git/
          ├── objects/
          │   ├── pack/
          │   │   ├── pack-{hash}.pack
          │   │   └── pack-{hash}.idx
          │   └── {first-2-chars}/
          │       └── {remaining-38-chars}
          ├── refs/
          │   ├── heads/
          │   ├── tags/
          │   └── remotes/
          ├── config
          ├── HEAD
          └── hooks/
```

**Optimization:**
- **Packfiles**: Compress objects into packs
- **Delta Compression**: Store deltas instead of full objects
- **Garbage Collection**: Periodic cleanup of unreachable objects
- **Deduplication**: Same objects across repos (content-addressable)

**Storage Distribution:**
- Distribute by repository hash
- Separate storage nodes for large repositories
- Use network-attached storage (NFS/GlusterFS) or object storage

### 3. Blob Storage (Large Files)

**Git LFS (Large File Storage):**
- Files > 100MB stored in object storage (S3/GCS)
- Git stores pointer files
- Download on-demand

**Architecture:**
```
Git Repository
  └── pointer file: "version https://git-lfs.github.com/spec/v1
                     oid sha256:abc123...
                     size 5000000000"
                     
Object Storage (S3)
  └── lfs/
      └── {oid} → actual file (5GB)
```

### 4. Cache Layer (Redis)

**Caching Strategy:**
- **L1 Cache**: Application-level (in-memory)
- **L2 Cache**: Redis (distributed)
- **L3 Cache**: CDN (static assets)

**Cache Keys:**
```
user:{user_id} → User object
repo:{owner}/{name} → Repository metadata
repo:{repo_id}:branches → Branch list
repo:{repo_id}:commits:{branch} → Recent commits
pr:{pr_id} → Pull request data
search:{query_hash} → Search results
```

**Cache Invalidation:**
- TTL-based expiration
- Event-driven invalidation (on updates)
- Cache-aside pattern

### 5. Search Index (Elasticsearch)

**Indices:**
- `code` - Code search index
- `repositories` - Repository search
- `users` - User search
- `issues` - Issue/PR search

**Indexing Pipeline:**
```
Repository Push
    ↓
Extract Files
    ↓
Parse Code (language, symbols)
    ↓
Index to Elasticsearch (async)
    ↓
Update Search Results
```

---

## API Design

### REST API

**Base URL:** `https://api.github.com`

**Endpoints:**

#### Repositories
```
GET    /repos/{owner}/{repo}
POST   /user/repos
PATCH  /repos/{owner}/{repo}
DELETE /repos/{owner}/{repo}
GET    /repos/{owner}/{repo}/branches
GET    /repos/{owner}/{repo}/commits
POST   /repos/{owner}/{repo}/forks
```

#### Pull Requests
```
GET    /repos/{owner}/{repo}/pulls
POST   /repos/{owner}/{repo}/pulls
GET    /repos/{owner}/{repo}/pulls/{number}
PATCH  /repos/{owner}/{repo}/pulls/{number}
POST   /repos/{owner}/{repo}/pulls/{number}/merge
GET    /repos/{owner}/{repo}/pulls/{number}/reviews
POST   /repos/{owner}/{repo}/pulls/{number}/reviews
```

#### Issues
```
GET    /repos/{owner}/{repo}/issues
POST   /repos/{owner}/{repo}/issues
GET    /repos/{owner}/{repo}/issues/{number}
PATCH  /repos/{owner}/{repo}/issues/{number}
```

#### Search
```
GET    /search/repositories?q={query}
GET    /search/code?q={query}
GET    /search/users?q={query}
GET    /search/issues?q={query}
```

**Rate Limiting:**
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour
- Use token bucket algorithm

### GraphQL API

**Advantages:**
- Fetch only needed fields
- Single request for multiple resources
- Strongly typed schema

**Example Query:**
```graphql
query {
  repository(owner: "octocat", name: "Hello-World") {
    name
    description
    stargazerCount
    issues(first: 10) {
      edges {
        node {
          title
          author {
            login
          }
        }
      }
    }
  }
}
```

**GraphQL Schema:**
```graphql
type Repository {
  id: ID!
  name: String!
  owner: RepositoryOwner!
  description: String
  stargazerCount: Int!
  forkCount: Int!
  issues(first: Int, after: String): IssueConnection!
  pullRequests(first: Int, after: String): PullRequestConnection!
}

type Issue {
  id: ID!
  title: String!
  body: String!
  author: Actor!
  state: IssueState!
  comments(first: Int): CommentConnection!
}
```

---

## Scalability & Performance

### Horizontal Scaling

**Stateless Services:**
- API servers are stateless
- Scale horizontally based on load
- Use load balancers for distribution

**Stateful Services:**
- Database: Read replicas + sharding
- Git storage: Distributed file system
- Cache: Redis cluster

### Caching Strategy

**Multi-Layer Caching:**
```
Request
  ↓
CDN Cache (static assets, API responses)
  ↓
Application Cache (in-memory, frequently accessed)
  ↓
Redis Cache (distributed, shared across instances)
  ↓
Database (with query cache)
```

**Cache Patterns:**
- **Cache-Aside**: Application manages cache
- **Write-Through**: Write to cache and DB simultaneously
- **Write-Back**: Write to cache, async to DB

### Database Optimization

**Indexing:**
```sql
-- User table
CREATE INDEX idx_user_username ON users(username);
CREATE INDEX idx_user_email ON users(email);

-- Repository table
CREATE INDEX idx_repo_owner ON repositories(owner_id);
CREATE INDEX idx_repo_full_name ON repositories(full_name);
CREATE INDEX idx_repo_visibility ON repositories(visibility, updated_at);

-- Commit table
CREATE INDEX idx_commit_repo_sha ON commits(repository_id, sha);
CREATE INDEX idx_commit_author ON commits(author_id, created_at);
```

**Query Optimization:**
- Use connection pooling
- Batch operations where possible
- Avoid N+1 queries (use JOINs or batch loading)
- Use read replicas for analytics queries

### Performance Targets

| Operation | Target Latency | Throughput |
|-----------|---------------|-------------|
| API Request (p95) | < 200ms | 10K req/s |
| Git Clone (small repo) | < 5s | 1K ops/s |
| Git Push (small repo) | < 10s | 500 ops/s |
| Search Query | < 500ms | 5K queries/s |
| Page Load | < 2s | - |

---

## Security Architecture

### Authentication

**Methods:**
1. **Username/Password**: Bcrypt hashing, rate limiting
2. **OAuth 2.0**: Standard OAuth flow
3. **Personal Access Tokens**: Scoped permissions
4. **SSH Keys**: RSA/Ed25519 keys
5. **GitHub Apps**: App-based authentication

**Security Measures:**
- Password complexity requirements
- 2FA support (TOTP, SMS, hardware keys)
- Session management (JWT tokens)
- Token rotation
- Rate limiting on auth endpoints

### Authorization

**Access Control Lists (ACL):**
```
Repository Permissions:
- Read: Clone, pull, view
- Write: Push, create branches
- Admin: Manage settings, delete
- Owner: Full control
```

**Branch Protection:**
- Require pull request reviews
- Require status checks
- Require up-to-date branches
- Restrict who can push
- Require signed commits

### Data Security

**Encryption:**
- **In Transit**: TLS 1.3 for all connections
- **At Rest**: Encrypted storage (AES-256)
- **Secrets**: Encrypted in database (application-level encryption)

**Vulnerability Scanning:**
- Dependabot: Dependency vulnerability alerts
- Code scanning: Static analysis (CodeQL)
- Secret scanning: Detect exposed secrets

### Audit Logging

**Logged Events:**
- Authentication attempts
- Permission changes
- Repository access
- Sensitive operations (delete, transfer)
- Admin actions

**Log Storage:**
- Centralized logging system
- Retention: 90 days (standard), 1 year (enterprise)
- Searchable and queryable

---

## Deployment & Infrastructure

### Infrastructure Components

**Compute:**
- Application servers (Rails, Go services)
- Git servers (dedicated for Git operations)
- Background workers (Sidekiq, Celery)

**Storage:**
- MySQL clusters (primary + replicas)
- Redis clusters (cache + queues)
- Object storage (S3/GCS for LFS, assets)
- File system (Git repositories)

**Networking:**
- Load balancers (AWS ELB, CloudFlare)
- CDN (CloudFlare, Fastly)
- VPN for internal services

### Deployment Strategy

**Blue-Green Deployment:**
```
Production (Blue)
    ↓
Deploy to Green
    ↓
Test Green
    ↓
Switch Traffic to Green
    ↓
Keep Blue as Rollback
```

**Canary Releases:**
- Deploy to 5% of traffic
- Monitor metrics
- Gradually increase to 100%

**Database Migrations:**
- Backward-compatible changes first
- Deploy application code
- Run migration
- Remove old code

### Monitoring & Observability

**Metrics:**
- Application metrics (response time, error rate)
- Infrastructure metrics (CPU, memory, disk)
- Business metrics (commits/day, active users)

**Logging:**
- Structured logging (JSON format)
- Centralized log aggregation (ELK stack)
- Log levels (DEBUG, INFO, WARN, ERROR)

**Tracing:**
- Distributed tracing (OpenTelemetry)
- Request ID propagation
- Performance profiling

**Alerting:**
- PagerDuty integration
- On-call rotation
- Alert thresholds and escalation

---

## Key Algorithms & Data Structures

### Git Merge Algorithm

**3-Way Merge:**
```
Base: Common ancestor
Ours: Current branch
Theirs: Branch to merge

For each file:
  if (ours == theirs):
    use either
  else if (base == ours):
    use theirs
  else if (base == theirs):
    use ours
  else:
    CONFLICT - manual resolution needed
```

### Consistent Hashing

**For Sharding:**
```python
def get_shard(user_id):
    hash_value = hash(user_id)
    shard_index = hash_value % NUM_SHARDS
    return shards[shard_index]
```

**Benefits:**
- Even distribution
- Minimal rehashing on shard addition/removal
- Predictable shard location

### Diff Algorithm

**Myers Algorithm (for code diffs):**
- Find shortest edit sequence
- O(ND) time complexity
- Used for pull request diffs

### Trie (for Code Search)

**Symbol Search:**
- Build trie from code symbols
- Fast prefix matching
- Used in code navigation

---

## Real-Time Features

### WebSocket Architecture

**Use Cases:**
- Live comments
- Real-time collaboration
- Notification updates
- PR status updates

**Architecture:**
```
Client
  ↓ (WebSocket)
WebSocket Server (Node.js/Go)
  ↓
Message Queue (Redis Pub/Sub, Kafka)
  ↓
Application Services
```

**Scaling:**
- Multiple WebSocket servers
- Use Redis Pub/Sub for cross-server communication
- Sticky sessions (affinity)

### Event Streaming

**Event Types:**
- Repository events (push, create, delete)
- PR events (open, close, merge)
- Issue events (create, comment, close)
- User events (follow, star)

**Pipeline:**
```
Event Source
  ↓
Event Bus (Kafka)
  ↓
Event Processors
  - Webhook delivery
  - Notification service
  - Search indexing
  - Analytics
```

---

## Search Architecture

### Code Search

**Indexing:**
1. Parse files (extract language, tokens)
2. Index tokens with positions
3. Index symbols (functions, classes)
4. Store file metadata

**Search Flow:**
```
Query: "function authenticate"
  ↓
Parse Query (extract tokens, language filters)
  ↓
Elasticsearch Query
  - Match "function" AND "authenticate"
  - Filter by language (optional)
  - Filter by repository (optional)
  ↓
Rank Results
  - Relevance score
  - Repository popularity
  - Recency
  ↓
Return Results (with highlights)
```

**Features:**
- Full-text search
- Regex support
- Language filtering
- File path filtering
- Symbol search
- Case sensitivity toggle

### Repository Search

**Indexed Fields:**
- Name
- Description
- README content
- Topics/tags
- Language
- Stars, forks (for ranking)

**Ranking Factors:**
- Relevance score
- Star count
- Recent activity
- Repository size
- Language match

---

## Notifications System

### Notification Types

- **Pull Request**: New PR, review requested, comments, merge
- **Issues**: New issue, mentions, assignments
- **Commits**: Comments on commits
- **Releases**: New release
- **Discussions**: Forum posts, comments

### Notification Delivery

**Channels:**
- In-app notifications
- Email
- Webhooks
- Mobile push (if mobile app)

**Preferences:**
- Per-repository settings
- Per-notification-type settings
- Quiet hours
- Digest mode (daily/weekly summary)

**Architecture:**
```
Event Triggered
  ↓
Notification Service
  ↓
Check User Preferences
  ↓
Queue Notifications
  ↓
Delivery Workers
  - Email service
  - Push service
  - Webhook delivery
```

---

## CI/CD Integration

### GitHub Actions

**Architecture:**
```
Repository Push/PR
  ↓
GitHub Actions Trigger
  ↓
Workflow Runner (VM/Container)
  ↓
Execute Steps
  - Checkout code
  - Run tests
  - Build artifacts
  - Deploy
  ↓
Report Status Back to PR
```

**Components:**
- **Workflow Files**: YAML definitions (.github/workflows/)
- **Runners**: VMs or containers for execution
- **Actions**: Reusable workflow steps
- **Artifacts**: Build outputs storage

**Scaling:**
- Self-hosted runners (for private repos)
- GitHub-hosted runners (public repos)
- Runner pools for load distribution

### Status Checks

**Integration Points:**
- CI/CD pipelines
- Code quality tools
- Security scanners
- Custom status checks

**PR Status:**
- All checks must pass for merge
- Required vs. optional checks
- Status aggregation

---

## Disaster Recovery & Backup

### Backup Strategy

**Data Types:**
1. **Git Repositories**: Full backups daily, incremental hourly
2. **Database**: Daily full backup, transaction log backups
3. **User Data**: Daily backups
4. **Configuration**: Version controlled

**Backup Storage:**
- Multiple regions
- Encrypted backups
- Regular restore testing

### Recovery Procedures

**RTO (Recovery Time Objective):**
- Critical services: < 1 hour
- Non-critical: < 4 hours

**RPO (Recovery Point Objective):**
- Zero data loss (for repositories)
- < 1 hour data loss acceptable (for metadata)

**Failover:**
- Automated failover for databases
- Manual failover for application services
- DNS failover for regions

---

## Cost Optimization

### Storage Optimization

- **Git Objects**: Deduplication, compression
- **Database**: Archive old data, partitioning
- **Cache**: TTL optimization, cache size limits

### Compute Optimization

- **Auto-scaling**: Scale down during low traffic
- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical workloads

### Network Optimization

- **CDN**: Cache static assets
- **Compression**: Gzip/Brotli for API responses
- **Bandwidth**: Optimize Git protocol (shallow clones)

---

## Future Considerations

### Scalability Challenges

1. **Repository Size**: Very large repos (monorepos)
2. **Concurrent Users**: Millions of simultaneous users
3. **Global Distribution**: Low latency worldwide
4. **Data Growth**: Exponential growth in repositories

### Potential Solutions

1. **Git Partial Clones**: Clone only needed parts
2. **Edge Computing**: Deploy closer to users
3. **Advanced Caching**: Predictive caching
4. **Data Archiving**: Archive inactive repositories

---

## Summary

GitHub's architecture is a complex, distributed system designed to handle massive scale while maintaining high availability and performance. Key architectural decisions:

1. **Microservices**: Loosely coupled, independently scalable services
2. **Sharding**: Horizontal partitioning for databases
3. **Caching**: Multi-layer caching for performance
4. **Event-Driven**: Asynchronous processing for scalability
5. **Security-First**: Comprehensive security measures
6. **Observability**: Full monitoring and logging

This architecture enables GitHub to serve 50M+ users, 100M+ repositories, and handle billions of operations daily while maintaining 99.9% uptime.

