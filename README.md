# Slime Colony

A god-game where you shepherd an ant/slime-mold colony that genuinely adapts through a genetic algorithm — watch evolution happen in real time.

## Controls

| Action | Input |
|---|---|
| Place food | Click canvas (food tool selected) |
| Rich food | Shift+click or enable "Rich food" checkbox |
| Pan camera | Middle-mouse drag / Space+drag |
| Zoom | Mouse wheel |
| Place rock/water | Select tool, then click |
| Erase | Erase tool + click |
| Inspect agent | Inspect tool + click near agent |
| Inject energy | Feed tool or "Inject Energy" button |
| Pause / Speed | ⏸ ▶ ⏩ ⏩⏩ buttons |

## How the Genetic Algorithm Works

Each agent carries 6 genes (sensor angle, sensor distance, rotation speed, movement speed, pheromone deposit rate, and hue). When the colony has enough energy, two parents are chosen weighted by age — older agents survived longer and are thus fitter. Their genes are crossed over and mutated slightly to produce offspring. Over generations, successful gene combinations dominate the population, which you can watch in the Gene Averages panel.

## Things to Try

1. **Starvation run**: Place no food for 60 seconds and watch the colony drain down; then drop food right as it's desperate and see agents swarm it.
2. **Obstacle course**: Paint a wall of rock between the nest and a food source; watch agents find paths around it over multiple generations.
3. **Poison field**: Surround a rich food source with poison — watch the colony learn to avoid the alarm pheromone trails.
4. **Speed breeding**: Set to 16x speed and watch 30+ generations evolve in a few minutes; compare gene charts before and after.
5. **Comeback colony**: Let the colony almost die (1-2 agents left), then inject energy and place rich food — watch it recover from near-extinction.

## Live Demo

[https://shaneenochs.github.io/simulation/](https://shaneenochs.github.io/simulation/)
