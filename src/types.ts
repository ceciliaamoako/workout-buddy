
 export type Workout = {
  id: number,
  name : string,
  gym: string,
  level: ExperienceLevel,
  workoutType: string,
  time: string
}

export type ExperienceLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"

export type FilterLevel = "All" | ExperienceLevel