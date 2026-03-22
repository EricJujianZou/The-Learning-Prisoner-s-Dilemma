// Single source of truth for all character text, audio paths, silhouettes, thresholds,
// and mid-round dialogue. opponents.js imports this and merges strategy functions in.

export const CHARACTERS = {
  pushover: {
    id: 'pushover',
    displayName: 'The Villain',
    strategyName: 'Always Cooperate',
    strategyDescription: 'Cooperates every single round, no matter what you do.',
    silhouetteStyle: 'slouched',
    intro:    { text: "I trust you. I know that's a lot to hear from a stranger but I mean it.",          audio: '/sounds/intro_pushover.mp3' },
    defeated: { text: "I texted you good morning every round and you did THIS?",                      audio: '/sounds/defeated_pushover.mp3' },
    winThreshold: { type: 'outscore' },
    rounds: 5,
    teaches: 'Exploitation is possible.',
    midRound: {
      onPlayerDefect:    ["You're being cruel."],
      onPlayerCooperate: ["Kind. Efficient. Both.", "Mutual cooperation. Boring, but optimal."],
    },
  },

  wall: {
    id: 'wall',
    displayName: 'Framemogging Gigachad',
    strategyName: 'Always Defect',
    strategyDescription: "Defects every round. It made up its mind before you sat down.",
    silhouetteStyle: 'rigid',
    intro:    { text: "You're going to cooperate first. They always cooperate first.",       audio: '/sounds/intro_wall.mp3' },
    defeated: { text: "We're the same now. You just don't want to admit it",                           audio: '/sounds/defeated_wall.mp3' },
    winThreshold: { type: 'minimum', value: 3 },
    rounds: 5,
    teaches: "Mutual defection is sometimes the only stable outcome.",
    midRound: {
      onPlayerCooperate: ["Still giving it chances?", "It won't change."],
      onPlayerDefect:    ["Smart. The only rational move here.", "Now you understand."],
    },
  },

  mirror: {
    id: 'mirror',
    displayName: 'The Believer',
    strategyName: 'Tit for Tat',
    strategyDescription: 'Starts by cooperating. Then copies your previous move exactly.',
    silhouetteStyle: 'mirrored',
    intro:    { text: "Be kind and I'll be kind. Be cruel and... well. You'll see.",          audio: '/sounds/intro_mirror.mp3' },
    defeated: { text: "You played yourself. Literally. I just held up the glass.",                            audio: '/sounds/defeated_mirror.mp3' },
    winThreshold: { type: 'minimum', value: 6 },
    rounds: 5,
    teaches: 'Reciprocity. Your moves have consequences next round.',
    midRound: {
      onFirstDefect:     ["There it is. Now watch.", "You started it."],
      onPlayerCooperate: ["It appreciates that.", "Mutual. Clean."],
    },
  },

  grudge: {
    id: 'grudge',
    displayName: 'The Philanthropist',
    strategyName: 'Grim Trigger',
    strategyDescription: 'Cooperates until you defect once. After that, defects forever.',
    silhouetteStyle: 'still',
    intro:    { text: "You'll know exactly when you ruined this. And so will I.", audio: '/sounds/intro_grudge.mp3' },
    defeated: { text: "The knife I was holding? You never gave me a reason to use it. Annoying.",                      audio: '/sounds/defeated_grudge.mp3' },
    winThreshold: { type: 'minimum', value: 5 },
    rounds: 5,
    teaches: 'Reputation matters. One betrayal can be permanent.',
    midRound: {
      onFirstDefect: ["You just crossed a line.", "That's permanent now."],
      onNoDefect:    ["Still clean.", "It trusts you. For now."],
    },
  },

  coin: {
    id: 'coin',
    displayName: 'The Gambler',
    strategyName: 'Pavlov (Win-Stay, Lose-Shift)',
    strategyDescription: "If its last payoff was 3 or more, it repeats its move. Otherwise it switches.",
    silhouetteStyle: 'fidgety',
    intro:    { text: "Heads I cooperate, tails I defect. Just kidding. Or am I. I forgot.", audio: '/sounds/intro_coin.mp3' },
    defeated: { text: "Hold on. Let me flip something. Okay yeah I lost. Moving on.",                                   audio: '/sounds/defeated_coin.mp3' },
    winThreshold: { type: 'minimum', value: 4 },
    rounds: 5,
    teaches: "Pattern reading. Opponent logic is based on their own outcomes.",
    midRound: {
      onPlayerCooperate: ["It's recalibrating.", "Watch what it does next."],
      onPlayerDefect:    ["It'll shift now.", "The pattern is visible if you look."],
    },
  },

  machine: {
    id: 'machine',
    displayName: 'The Learner [BOSS]',
    strategyName: 'Q-Learning Agent',
    strategyDescription: "Learns your patterns in real time. Phase 1 explores. Phase 2 exploits.",
    silhouetteStyle: 'computing',
    intro:    { text: "I don't know your strategy yet. You have ten rounds before I do", audio: '/sounds/intro_machine.mp3' },
    defeated: { text: "I adapted to you. You adapted to my adaptation. Stack overflow.",  audio: '/sounds/defeated_machine.mp3' },
    winThreshold: { type: 'outscore' },
    rounds: 20,
    teaches: "Adaptive agents require adaptive counter-strategies.",
    midRound: {
      onAgentExplore: ["Still mapping.", "It's not done exploring."],
      onAgentExploit: ["It's settled on something.", "Pattern locked."],
      onPhaseShift:   ["Phase 2. It has a policy now.", "The game just changed."],
    },
  },
};

export const NARRATOR = {
  landing:    "Everyone thinks they'd cooperate. Sit down. Let's find out",
  win:        ["You figured it out. Most don't.", "Clean. Next.", "You're not as nice as you think you are. That's a compliment."],
  lose:       ["Hm. Try again.", "It's not random. Think.", "You're smarter than that. Probably."],
  rlWin:      "You outlearned the learner. Congrats.",
  rlLose:     "It learned faster than you adapted. That happens.",
  leaderboard: "Immortality is a text field and a number. Let them know you were here.",
};

export const SFX = {
  buttonCooperate: '/sounds/btn_cooperate.mp3',
  buttonDefect:    '/sounds/btn_defect.mp3',
  roundReveal:     '/sounds/round_reveal.mp3',
  win:             '/sounds/win.mp3',
  lose:            '/sounds/lose.mp3',
  doorOpen:        '/sounds/door_open.mp3',
  clipboardSlide:  '/sounds/clipboard_slide.mp3',
  phaseShift:      '/sounds/phase_shift.mp3',
};
