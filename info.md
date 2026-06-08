A Harry Potter-style Weasley family clock for Home Assistant. Family members
appear as animated clock hands pointing to their current location zone.

![Example clock](https://raw.githubusercontent.com/genebean/weasley-wizarding-clock-card/main/example.png)

## Installation

1. Search for **Weasley Wizarding Clock Card** in HACS and install it.
2. Add the card to your dashboard via the card picker or in YAML:

```yaml
type: custom:weasley-wizarding-clock-card
wizards:
  - entity: person.harry
    name: Harry
  - entity: person.hermione
    name: Hermione
locations:
  - Home
  - School
  - Work
```

The card has a full visual editor — no YAML required for basic setup.

## Migrating from the upstream wizard-clock-card

This card is a drop-in replacement. Install via HACS, then change the `type`
in each existing card from `custom:wizard-clock-card` to
`custom:weasley-wizarding-clock-card`. Everything else — entities, locations, colours,
fonts — carries over unchanged.

## Configuration

### Full config reference

```yaml
type: custom:weasley-wizarding-clock-card

# ── Required ──────────────────────────────────────────────────────────────────

wizards:                          # at least one required
  - entity: person.harry          # person, device_tracker, or calendar entity
    name: Harry                   # display name on the clock hand
    colour: "#F00"                # hand fill colour (hex, CSS name, or theme token)
    textcolour: "#FFF"            # name label colour
    proximity_sensor: sensor.home_harry_direction_of_travel  # optional

# ── Locations ─────────────────────────────────────────────────────────────────

locations:                        # ordered list of zones to show permanently
  - Home
  - Work
  - School

# ── Clock appearance ──────────────────────────────────────────────────────────

face_colour:     "#EDE0C4"        # clock face background (default: parchment)
border_colour:   "#1a1a1a"        # face ring colour (default: dark)
shaft_colour:    "#1a1a1a"        # hand hinge and shaft colour (default: dark)
location_colour: "#1a1a1a"        # location label text colour (default: dark)

# ── Typography ────────────────────────────────────────────────────────────────

fontName: "Harry P"               # CSS font-family value
fontface: >-                      # raw @font-face CSS (expert use only)
  font-family: "Harry P";
  src: url("/local/HarryP.ttf") format("truetype");

# ── Labels and behaviour ──────────────────────────────────────────────────────

header: "Family Clock"            # card title (omit for no header)
lost: "In Mortal Peril"           # label when location is unknown (default: Lost)
travelling: "On the Road"         # label when moving (default: Travelling)
min_location_slots: 5             # minimum spokes shown, padded with blanks
exclude:                          # states to treat as "lost"
  - Just Arrived
  - Just Left
```

### Colour values

All colour fields accept:
- Hex strings: `"#FF0000"`
- CSS named colours: `"red"`
- HA theme tokens: `"primary"`, `"accent"`, `"secondary-background"`, etc.

## Features

- Animated hands ease smoothly between location zones
- Visual card editor — no YAML required for basic setup
- Auto-sizes to fit any card layout (masonry and sections)
- Location labels auto-shrink to prevent overlap when many zones are shown
- Supports `person`, `device_tracker`, and `calendar` entities
- Proximity sensor support for direction-of-travel detection
- Customisable "Lost" and "Travelling" state labels
- RTL language support
