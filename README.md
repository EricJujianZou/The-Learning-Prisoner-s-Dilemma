# The Prisoner's Game

Can you outscore an AI that learns how you think?

A browser game where you play the Prisoner's Dilemma against 5 mystery opponents, then face a Q-learning agent that adapts to your play style in real time. Beat all 6 to make the leaderboard.

## How it works

You sit in an interrogation room. On the other side of the glass is an opponent you can't read. Each round, you both choose: **cooperate** or **defect**. The payoff matrix decides the score.

|              | They Cooperate | They Defect |
|--------------|:-:|:-:|
| **You Cooperate** | 3 / 3 | 0 / 5 |
| **You Defect**    | 5 / 0 | 1 / 1 |

5 opponents play by fixed rules you don't know. The 6th learns yours.

## The opponents

Five hardcoded strategies served in random order. You don't know which is which until you beat them.

The final boss is a Q-learning reinforcement learning agent. 10 rounds to study you, 10 rounds to exploit what it learned.

## The concepts

This game touches on: the Prisoner's Dilemma, Nash Equilibrium, tit for tat, grim trigger, Pavlov (win-stay lose-shift), Q-learning, bounded rationality, and the explore/exploit tradeoff. You don't need to know any of that going in. The game teaches through play.

## Stack

React + Vite + Tailwind CSS + Framer Motion. No backend. Leaderboard uses browser persistent storage. Hosted on Vercel.

## Credits

Game design, voice acting, and character direction by ElevenLabs.

Sound effects from [Pixabay](https://pixabay.com/sound-effects/) (royalty free, no attribution required).

Character art generated with Google AI Studio.

Built with help from Claude.

## License

MIT
