import { FormEvent, useMemo, useState } from 'react'
import { buddies, gyms, workouts } from './data'
import type { Buddy, Experience, Gender, SessionRequest, UserProfile } from './types'

type View = 'discover' | 'saved' | 'sessions' | 'profile'

type Filters = {
  gym: string
  workout: string
  gender: 'Any' | Gender
  weightMin: number
  weightMax: number
  firstTimerFriendly: boolean
}

const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key)
      return value ? (JSON.parse(value) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value))
  },
}

const defaultProfile: UserProfile = {
  name: 'Alex Morgan',
  homeGym: 'NoDa Fitness House',
  experience: 'Beginner',
  preferredGender: 'Any',
  weight: 155,
  goals: ['Build consistency', 'Get comfortable at the gym'],
  bio: 'Getting more comfortable with commercial gyms and looking for a reliable, platonic workout buddy.',
  walkInHelp: true,
}

function App() {
  const [view, setView] = useState<View>('discover')
  const [savedIds, setSavedIds] = useState<number[]>(() => storage.get('gymbuddy.saved', [1, 5]))
  const [requests, setRequests] = useState<SessionRequest[]>(() => storage.get('gymbuddy.requests', []))
  const [profile, setProfile] = useState<UserProfile>(() => storage.get('gymbuddy.profile', defaultProfile))
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null)
  const [toast, setToast] = useState('')
  const [walkInMode, setWalkInMode] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    gym: 'Any gym',
    workout: 'Any workout',
    gender: 'Any',
    weightMin: 120,
    weightMax: 210,
    firstTimerFriendly: false,
  })

  const filteredBuddies = useMemo(() => {
    return buddies.filter((buddy) => {
      if (filters.gym !== 'Any gym' && buddy.gym !== filters.gym) return false
      if (filters.workout !== 'Any workout' && !buddy.workouts.includes(filters.workout)) return false
      if (filters.gender !== 'Any' && buddy.gender !== filters.gender) return false
      if (buddy.weight < filters.weightMin || buddy.weight > filters.weightMax) return false
      if (filters.firstTimerFriendly && !buddy.firstTimerFriendly) return false
      if (walkInMode && !buddy.firstTimerFriendly) return false
      return true
    })
  }, [filters, walkInMode])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function toggleSaved(id: number) {
    const next = savedIds.includes(id) ? savedIds.filter((item) => item !== id) : [...savedIds, id]
    setSavedIds(next)
    storage.set('gymbuddy.saved', next)
    notify(savedIds.includes(id) ? 'Removed from saved buddies' : 'Buddy saved')
  }

  function addRequest(request: SessionRequest) {
    const next = [request, ...requests]
    setRequests(next)
    storage.set('gymbuddy.requests', next)
    setSelectedBuddy(null)
    setView('sessions')
    notify('Session request sent')
  }

  function cancelRequest(id: string) {
    const next = requests.filter((request) => request.id !== id)
    setRequests(next)
    storage.set('gymbuddy.requests', next)
    notify('Session request cancelled')
  }

  function saveProfile(nextProfile: UserProfile) {
    setProfile(nextProfile)
    storage.set('gymbuddy.profile', nextProfile)
    notify('Profile updated')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('discover')} aria-label="GymBuddy home">
          <span className="brand-mark">GB</span>
          <span>GymBuddy</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <NavButton active={view === 'discover'} onClick={() => setView('discover')}>Discover</NavButton>
          <NavButton active={view === 'saved'} onClick={() => setView('saved')}>Saved <span className="nav-count">{savedIds.length}</span></NavButton>
          <NavButton active={view === 'sessions'} onClick={() => setView('sessions')}>Sessions <span className="nav-count">{requests.length}</span></NavButton>
        </nav>
        <button className="profile-chip" onClick={() => setView('profile')}>
          <span className="avatar small">AM</span>
          <span>{profile.name.split(' ')[0]}</span>
        </button>
      </header>

      <main>
        {view === 'discover' && (
          <DiscoverView
            filteredBuddies={filteredBuddies}
            filters={filters}
            setFilters={setFilters}
            savedIds={savedIds}
            toggleSaved={toggleSaved}
            onRequest={setSelectedBuddy}
            walkInMode={walkInMode}
            setWalkInMode={setWalkInMode}
          />
        )}
        {view === 'saved' && (
          <SavedView
            savedBuddies={buddies.filter((buddy) => savedIds.includes(buddy.id))}
            savedIds={savedIds}
            toggleSaved={toggleSaved}
            onRequest={setSelectedBuddy}
            onDiscover={() => setView('discover')}
          />
        )}
        {view === 'sessions' && <SessionsView requests={requests} cancelRequest={cancelRequest} onDiscover={() => setView('discover')} />}
        {view === 'profile' && <ProfileView profile={profile} onSave={saveProfile} />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <MobileNavButton active={view === 'discover'} onClick={() => setView('discover')} icon="⌂">Discover</MobileNavButton>
        <MobileNavButton active={view === 'saved'} onClick={() => setView('saved')} icon="♡">Saved</MobileNavButton>
        <MobileNavButton active={view === 'sessions'} onClick={() => setView('sessions')} icon="◷">Sessions</MobileNavButton>
        <MobileNavButton active={view === 'profile'} onClick={() => setView('profile')} icon="○">Profile</MobileNavButton>
      </nav>

      {selectedBuddy && <RequestModal buddy={selectedBuddy} onClose={() => setSelectedBuddy(null)} onSubmit={addRequest} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}

function MobileNavButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: string; children: React.ReactNode }) {
  return (
    <button className={`mobile-nav-button ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="mobile-icon">{icon}</span>
      <span>{children}</span>
    </button>
  )
}

function DiscoverView({ filteredBuddies, filters, setFilters, savedIds, toggleSaved, onRequest, walkInMode, setWalkInMode }: {
  filteredBuddies: Buddy[]
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  savedIds: number[]
  toggleSaved: (id: number) => void
  onRequest: (buddy: Buddy) => void
  walkInMode: boolean
  setWalkInMode: (value: boolean) => void
}) {
  return (
    <>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <span className="eyebrow">PLATONIC · LOCAL · LOW PRESSURE</span>
          <h1>Never walk into the gym alone.</h1>
          <p>Find someone who knows your gym, meet another first-timer, or match with a workout partner who fits your routine.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setWalkInMode(!walkInMode)}>
              {walkInMode ? 'Showing walk-in buddies' : 'Find a walk-in companion'}
            </button>
            <a className="text-link" href="#matches">Browse all matches ↓</a>
          </div>
        </div>
        <div className="hero-card" aria-label="How GymBuddy works">
          <div className="hero-card-top">
            <span className="status-dot"></span>
            <span>FIRST GYM VISIT</span>
          </div>
          <div className="walkin-visual">
            <div className="door">GYM</div>
            <div className="person-bubble one">YOU</div>
            <div className="connector">+</div>
            <div className="person-bubble two">BUDDY</div>
          </div>
          <p><strong>Meet at the entrance.</strong> Your buddy can help make the first few minutes feel familiar—no training or payment involved.</p>
        </div>
      </section>

      <section className="trust-strip">
        <div><strong>100%</strong><span>platonic</span></div>
        <div><strong>Gym-specific</strong><span>matching</span></div>
        <div><strong>First-timer</strong><span>friendly</span></div>
        <div><strong>No trainers</strong><span>no selling</span></div>
      </section>

      <section className="section-wrap matches-section" id="matches">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">DISCOVER</span>
            <h2>Find your gym people</h2>
          </div>
          <p>{filteredBuddies.length} matches</p>
        </div>

        <div className="filter-panel">
          <label>Gym
            <select value={filters.gym} onChange={(e) => setFilters({ ...filters, gym: e.target.value })}>
              {gyms.map((gym) => <option key={gym}>{gym}</option>)}
            </select>
          </label>
          <label>Workout
            <select value={filters.workout} onChange={(e) => setFilters({ ...filters, workout: e.target.value })}>
              {workouts.map((workout) => <option key={workout}>{workout}</option>)}
            </select>
          </label>
          <label>Gender preference
            <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value as Filters['gender'] })}>
              <option>Any</option>
              <option>Woman</option>
              <option>Man</option>
              <option>Non-binary</option>
            </select>
          </label>
          <label>Weight range
            <div className="range-row">
              <input aria-label="Minimum weight" type="number" min="90" max="300" value={filters.weightMin} onChange={(e) => setFilters({ ...filters, weightMin: Number(e.target.value) })} />
              <span>to</span>
              <input aria-label="Maximum weight" type="number" min="90" max="300" value={filters.weightMax} onChange={(e) => setFilters({ ...filters, weightMax: Number(e.target.value) })} />
            </div>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={filters.firstTimerFriendly} onChange={(e) => setFilters({ ...filters, firstTimerFriendly: e.target.checked })} />
            <span>First-timer friendly only</span>
          </label>
        </div>

        {walkInMode && (
          <div className="mode-banner">
            <div><strong>Walk-in mode is on.</strong> You’re seeing people who are comfortable meeting first-timers at the entrance.</div>
            <button onClick={() => setWalkInMode(false)}>Clear</button>
          </div>
        )}

        <div className="buddy-grid">
          {filteredBuddies.map((buddy) => (
            <BuddyCard key={buddy.id} buddy={buddy} saved={savedIds.includes(buddy.id)} onSave={() => toggleSaved(buddy.id)} onRequest={() => onRequest(buddy)} />
          ))}
        </div>

        {filteredBuddies.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">⌁</span>
            <h3>No exact matches yet</h3>
            <p>Try widening your weight range or choosing any gym/workout.</p>
            <button className="secondary-button" onClick={() => setFilters({ gym: 'Any gym', workout: 'Any workout', gender: 'Any', weightMin: 120, weightMax: 210, firstTimerFriendly: false })}>Reset filters</button>
          </div>
        )}
      </section>
    </>
  )
}

function BuddyCard({ buddy, saved, onSave, onRequest }: { buddy: Buddy; saved: boolean; onSave: () => void; onRequest: () => void }) {
  return (
    <article className="buddy-card">
      <div className="buddy-card-head">
        <div className={`avatar large ${buddy.accent}`}>{buddy.initials}</div>
        <button className={`save-button ${saved ? 'saved' : ''}`} onClick={onSave} aria-label={saved ? 'Unsave buddy' : 'Save buddy'}>{saved ? '♥' : '♡'}</button>
      </div>
      <div className="buddy-name-row">
        <h3>{buddy.name}, {buddy.age}</h3>
        {buddy.firstTimerFriendly && <span className="verified-chip">✓ first-timer friendly</span>}
      </div>
      <p className="buddy-location">{buddy.gym} · {buddy.neighborhood}</p>
      <div className="mini-stats">
        <span>{buddy.experience}</span>
        <span>{buddy.weight} lb</span>
        <span>★ {buddy.rating} · {buddy.sessions} sessions</span>
      </div>
      <p className="buddy-bio">{buddy.bio}</p>
      <div className="tag-row">
        {buddy.workouts.map((workout) => <span className="tag" key={workout}>{workout}</span>)}
      </div>
      <div className="availability">
        <span className="availability-title">Next available</span>
        <strong>{buddy.availability[0]}</strong>
      </div>
      <button className="primary-button full" onClick={onRequest}>Request a session</button>
    </article>
  )
}

function SavedView({ savedBuddies, savedIds, toggleSaved, onRequest, onDiscover }: {
  savedBuddies: Buddy[]
  savedIds: number[]
  toggleSaved: (id: number) => void
  onRequest: (buddy: Buddy) => void
  onDiscover: () => void
}) {
  return (
    <section className="section-wrap page-section">
      <span className="eyebrow">YOUR SHORTLIST</span>
      <h1 className="page-title">Saved buddies</h1>
      <p className="page-subtitle">Keep track of people who look like a good fit before you send a session request.</p>
      {savedBuddies.length ? (
        <div className="buddy-grid saved-grid">
          {savedBuddies.map((buddy) => <BuddyCard key={buddy.id} buddy={buddy} saved={savedIds.includes(buddy.id)} onSave={() => toggleSaved(buddy.id)} onRequest={() => onRequest(buddy)} />)}
        </div>
      ) : (
        <div className="empty-state"><h3>No saved buddies yet</h3><p>Save a few people from Discover and they’ll show up here.</p><button className="primary-button" onClick={onDiscover}>Discover buddies</button></div>
      )}
    </section>
  )
}

function SessionsView({ requests, cancelRequest, onDiscover }: { requests: SessionRequest[]; cancelRequest: (id: string) => void; onDiscover: () => void }) {
  return (
    <section className="section-wrap page-section">
      <span className="eyebrow">PLANS</span>
      <h1 className="page-title">Your sessions</h1>
      <p className="page-subtitle">Demo requests are stored in your browser so you can refresh and keep testing the flow.</p>
      {requests.length ? (
        <div className="session-list">
          {requests.map((request) => (
            <article className="session-card" key={request.id}>
              <div className="session-date-tile">
                <span>{new Date(`${request.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span>
                <strong>{new Date(`${request.date}T12:00:00`).getDate()}</strong>
              </div>
              <div className="session-main">
                <div className="session-topline"><h3>{request.workout} with {request.buddyName}</h3><span className="pending-chip">{request.status}</span></div>
                <p>{request.gym} · {request.time}</p>
                {request.note && <p className="session-note">“{request.note}”</p>}
              </div>
              <button className="ghost-danger" onClick={() => cancelRequest(request.id)}>Cancel</button>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><span className="empty-icon">◷</span><h3>No sessions requested yet</h3><p>Find someone whose gym, routine, and availability match yours.</p><button className="primary-button" onClick={onDiscover}>Find a buddy</button></div>
      )}
    </section>
  )
}

function ProfileView({ profile, onSave }: { profile: UserProfile; onSave: (profile: UserProfile) => void }) {
  const [draft, setDraft] = useState(profile)
  const [goalInput, setGoalInput] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    onSave(draft)
  }

  function addGoal() {
    const value = goalInput.trim()
    if (!value || draft.goals.includes(value)) return
    setDraft({ ...draft, goals: [...draft.goals, value] })
    setGoalInput('')
  }

  return (
    <section className="section-wrap page-section profile-layout">
      <aside className="profile-preview">
        <div className="avatar xlarge blue">AM</div>
        <h2>{draft.name}</h2>
        <p>{draft.homeGym}</p>
        <span className="verified-chip">{draft.experience}</span>
        <div className="profile-rule"></div>
        <strong>Looking for</strong>
        <div className="tag-row">{draft.goals.map((goal) => <span className="tag" key={goal}>{goal}</span>)}</div>
        <p className="profile-bio">{draft.bio}</p>
        <div className="safety-note"><strong>GymBuddy promise</strong><span>Keep it platonic, respectful, workout-focused, and public-gym based.</span></div>
      </aside>

      <form className="profile-form" onSubmit={submit}>
        <span className="eyebrow">PROFILE</span>
        <h1 className="page-title">Make better matches</h1>
        <div className="form-grid two">
          <label>Name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label>
          <label>Home gym<select value={draft.homeGym} onChange={(e) => setDraft({ ...draft, homeGym: e.target.value })}>{gyms.filter((gym) => gym !== 'Any gym').map((gym) => <option key={gym}>{gym}</option>)}</select></label>
          <label>Experience<select value={draft.experience} onChange={(e) => setDraft({ ...draft, experience: e.target.value as Experience })}><option>First timer</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
          <label>Preferred buddy gender<select value={draft.preferredGender} onChange={(e) => setDraft({ ...draft, preferredGender: e.target.value as UserProfile['preferredGender'] })}><option>Any</option><option>Woman</option><option>Man</option><option>Non-binary</option></select></label>
          <label>Weight (lb)<input type="number" min="90" max="300" value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })} /></label>
          <label className="checkbox-card"><input type="checkbox" checked={draft.walkInHelp} onChange={(e) => setDraft({ ...draft, walkInHelp: e.target.checked })} /><span><strong>I want walk-in support</strong><small>Prioritize people comfortable meeting at the gym entrance.</small></span></label>
        </div>
        <label>About me<textarea rows={4} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} /></label>
        <label>Goals</label>
        <div className="goal-editor">
          <div className="tag-row">{draft.goals.map((goal) => <button type="button" className="tag editable" key={goal} onClick={() => setDraft({ ...draft, goals: draft.goals.filter((item) => item !== goal) })}>{goal} ×</button>)}</div>
          <div className="goal-input-row"><input placeholder="Add a goal" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }} /><button type="button" className="secondary-button" onClick={addGoal}>Add</button></div>
        </div>
        <button className="primary-button save-profile" type="submit">Save profile</button>
      </form>
    </section>
  )
}

function RequestModal({ buddy, onClose, onSubmit }: { buddy: Buddy; onClose: () => void; onSubmit: (request: SessionRequest) => void }) {
  const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const [workout, setWorkout] = useState(buddy.workouts[0])
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('18:30')
  const [note, setNote] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    onSubmit({
      id: crypto.randomUUID(),
      buddyId: buddy.id,
      buddyName: buddy.name,
      gym: buddy.gym,
      workout,
      date,
      time: new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      note,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="request-title" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-person"><div className={`avatar large ${buddy.accent}`}>{buddy.initials}</div><div><span className="eyebrow">SESSION REQUEST</span><h2 id="request-title">Work out with {buddy.name}</h2><p>{buddy.gym}</p></div></div>
        <form onSubmit={submit}>
          <div className="form-grid two">
            <label>Workout<select value={workout} onChange={(e) => setWorkout(e.target.value)}>{buddy.workouts.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Date<input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} required /></label>
            <label>Time<input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></label>
            <div className="modal-hint"><strong>{buddy.buddyMode}</strong><span>{buddy.firstTimerFriendly ? 'Comfortable with first-timers' : 'Best for regular workout sessions'}</span></div>
          </div>
          <label>Message <span className="optional">optional</span><textarea rows={3} maxLength={180} placeholder="Hey! I’m new to this gym and would love to meet at the entrance..." value={note} onChange={(e) => setNote(e.target.value)} /></label>
          <div className="modal-safety">Requests are for public gym meetups only. GymBuddy is not a dating or personal-training marketplace.</div>
          <button className="primary-button full" type="submit">Send request</button>
        </form>
      </div>
    </div>
  )
}

export default App
