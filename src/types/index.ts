export type Category = 'Fitness' | 'Career' | 'Investing' | 'Academics' | 'Personal' | 'Other'
export type MetricType = 'number' | 'boolean' | 'streak' | 'money' | 'time' | 'weight' | 'custom'
export type Visibility = 'public' | 'friends' | 'private' | 'group'
export type GroupRole = 'admin' | 'member'
export type NotificationType = 'like' | 'comment' | 'follow' | 'streak_risk' | 'goal_complete' | 'recap'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  school_or_company: string | null
  is_public: boolean
  created_at: string
  is_admin?: boolean
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: Category | null
  metric_type: MetricType | null
  target_value: number | null
  target_unit: string | null
  deadline: string | null
  visibility: Visibility
  group_id: string | null
  wager_description: string | null
  is_active: boolean
  created_at: string
  profiles?: Profile
  check_ins?: CheckIn[]
  _count?: { check_ins: number }
}

export interface CheckIn {
  id: string
  goal_id: string
  user_id: string
  value: number | null
  note: string | null
  proof_url: string | null
  checked_in_at: string
  goals?: Goal
  profiles?: Profile
  likes?: Like[]
  comments?: Comment[]
  _likes_count?: number
  _user_liked?: boolean
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  created_by: string | null
  invite_code: string | null
  is_private: boolean
  created_at: string
  profiles?: Profile
  group_members?: GroupMember[]
  _member_count?: number
}

export interface GroupMember {
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
  profiles?: Profile
  groups?: Group
}

export interface Comment {
  id: string
  user_id: string
  goal_id: string
  check_in_id: string | null
  body: string
  created_at: string
  profiles?: Profile
}

export interface Like {
  user_id: string
  check_in_id: string
  created_at: string
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string | null
  goal_id: string | null
  check_in_id: string | null
  is_read: boolean
  created_at: string
  actor?: Profile
  goal?: Goal
  check_in?: CheckIn
}

export interface StreakInfo {
  current: number
  longest: number
  atRisk: boolean
}

export interface LeaderboardEntry {
  profile: Profile
  stat: number
  rank: number
}

export interface FeedEvent {
  id: string
  type: 'check_in' | 'new_goal' | 'milestone' | 'streak_hit' | 'streak_broken'
  actor: Profile
  goal?: Goal
  check_in?: CheckIn
  timestamp: string
}
