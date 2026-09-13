import './App.css'
import WorkoutCard from './WorkoutCard'
import type { Workout , FilterLevel} from './types'

import { useState} from 'react'

function App(){

  const [selectedLevel, setSelectedLevel] = useState<FilterLevel>("All")

  const levels: FilterLevel[] = ["All", "Beginner", "Intermediate", "Advanced"]

  const [workouts, setWorkouts] = useState<Workout[]>(
      [
        {
          id: 1,
          name: "Sarah",
          gym: "Planet Fitness - University City",
          level: "Beginner",
          workoutType: "Leg Day",
          time: "6:30 PM"
        },
        { 
          id: 2,
          name: "Maya",
          gym: "Planet Fitness - University City",
          level: "Intermediate",
          workoutType: "Upper Body",
          time: "7:00 PM"
        },
        { 
          id: 3,
          name: "Jordan",
          gym: "Planet Fitness - University City",
          level: "Advanced",
          workoutType: "Push Day",
          time: "7:00 PM"
        }
    ]
  )

  const filteredWorkouts = workouts.filter((workout) =>
  {
    if (selectedLevel === "All"){
      return true
    }

    return workout.level === selectedLevel
  })

  return(
    <>
    <div>
     <h1>Workout Buddy</h1>
     <p>Find someone to work out with.</p>
    </div>

    {
      levels.map((level) => {
        return(
          <button 
          key={level}
          onClick={() => setSelectedLevel(level)}>{level}</button>
        )
      }

      )
    }

    <p>Selected level: {selectedLevel}</p>
     
    {
      filteredWorkouts.map((workout) => {
        return(
        <WorkoutCard 
          key={workout.id}
          workout={workout}
        />
      )})
    }

    </>
  )
}

export default App