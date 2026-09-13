import { useState} from 'react'
import type { Workout } from './types'

type WorkoutCardProps = {
  workout : Workout
}

function WorkoutCard({ workout }: WorkoutCardProps){

    const [joined, setJoined] = useState(false)

    return (
      <div>
        <h2>{workout.name}</h2>
        <p>{workout.gym}</p>
        <p>{workout.level}</p>
        <p>{workout.workoutType}</p>
        <p>{workout.time}</p>
        <button onClick={() => setJoined((previousJoined) => !previousJoined)}>
          {joined ? "Joined" : "Join Workout"}
        </button>
      </div>
    )
  }

export default WorkoutCard