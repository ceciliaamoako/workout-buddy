export type Experience = 'First timer' | 'Beginner' | 'Intermediate' | 'Advanced'
export type Gender = 'Woman' | 'Man' | 'Non-binary'
export type BuddyMode = 'Workout buddy' | 'Walk-in companion' | 'Either'

export interface Workout {
  name: string
  gym: string
  level: string
  workoutType: string
  time: string
}

export interface Buddy {
  id: number
  name: string
  initials: string
  age: number
  gender: Gender
  gym: string
  neighborhood: string
  experience: Experience
  weight: number
  workouts: string[]
  availability: string[]
  bio: string
  firstTimerFriendly: boolean
  buddyMode: BuddyMode
  rating: number
  sessions: number
  accent: string
}

export interface SessionRequest {
  id: string
  buddyId: number
  buddyName: string
  gym: string
  workout: string
  date: string
  time: string
  note: string
  status: 'Pending' | 'Confirmed'
  createdAt: string
}

export interface UserProfile {
  name: string
  homeGym: string
  experience: Experience
  preferredGender: 'Any' | Gender
  weight: number
  goals: string[]
  bio: string
  walkInHelp: boolean
}
