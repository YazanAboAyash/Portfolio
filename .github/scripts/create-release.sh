#!/usr/bin/env bash
# Publishes the GitHub release for a freshly bumped tag (called from bump-version.yml).
# Picks an unused name from release-names.txt and fills release-template.md.
# Usage: create-release.sh <tag>   (DRY_RUN=1 prints the title and body instead)
set -euo pipefail

TAG="$1"
GITHUB_DIR="$(dirname "$0")/.."
REPO="${GITHUB_REPOSITORY:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
PREV_TAG=$(git describe --tags --abbrev=0 "$TAG^")

# Name: skip any whose romaji or kanji already appears in an existing release title.
USED_TITLES=$(gh release list --limit 1000 --json name --jq '.[].name')
mapfile -t ALL_NAMES < <(grep -v '^\s*#' "$GITHUB_DIR/release-names.txt" | sed '/^\s*$/d')
FRESH_NAMES=()
for entry in "${ALL_NAMES[@]}"; do
    IFS='|' read -r romaji kanji _ <<< "$entry"
    if ! grep -qiwF "$romaji" <<< "$USED_TITLES" && ! grep -qF "$kanji" <<< "$USED_TITLES"; then
        FRESH_NAMES+=("$entry")
    fi
done
(( ${#FRESH_NAMES[@]} )) || FRESH_NAMES=("${ALL_NAMES[@]}")
IFS='|' read -r ROMAJI KANJI MEANING <<< "${FRESH_NAMES[RANDOM % ${#FRESH_NAMES[@]}]}"

# Changes: commit subjects since the previous tag, grouped by conventional-commit type.
SUBJECTS=$(git log --no-merges --format=%s "$PREV_TAG..$TAG" | grep -vF '[skip ci]' || true)
CONVENTIONAL='^[a-z]+(\([^)]*\))?!?: *'
section() { # <heading> <grep args...>
    local items
    items=$(grep "${@:2}" <<< "$SUBJECTS" | sed -E "s/$CONVENTIONAL//; s/^(.)/- \u\1/" || true)
    if [[ -n $items ]]; then printf '## %s\n\n%s' "$1" "$items"; fi
}
CHANGES=""
for s in "$(section Features -E '^feat(\(|!|:)')" \
         "$(section Fixes -E '^fix(\(|!|:)')" \
         "$(section Maintenance -vE '^(feat|fix)(\(|!|:)')"; do
    if [[ -n $s ]]; then CHANGES+="${CHANGES:+$'\n\n---\n\n'}$s"; fi
done

# Stats, formatted like "+10,393 / −13,332".
thousands() { sed ':a;s/\B[0-9]\{3\}\>/,&/;ta'; }
SHORTSTAT=$(git diff --shortstat "$PREV_TAG" "$TAG")
stat() { grep -oE "[0-9]+ $1" <<< "$SHORTSTAT" | grep -oE '^[0-9]+' | thousands || echo 0; }
COMMITS=$(git rev-list --count "$PREV_TAG..$TAG")
FILES=$(stat 'files? changed')
INSERTIONS=$(stat 'insertions?')
DELETIONS=$(stat 'deletions?')

TITLE="${ROMAJI^^} $KANJI"

# Copilot rewrites the changes into themed sections plus a summary line, in the style of the
# latest release. Without COPILOT_GITHUB_TOKEN, or if its reply is malformed, the grouped
# commit list above is kept. No tools are pre-approved, so Copilot can only read the prompt.
SUMMARY=""
if [[ -n ${COPILOT_GITHUB_TOKEN:-} ]] && command -v copilot > /dev/null; then
    PROMPT="You write the GitHub release notes for the portfolio site coldbydefault.com.
This release is $TITLE, version ${TAG#v}. Its name means \"$MEANING\".

Match the style of the previous release notes below: '## ' headings that group changes by theme
(not by commit type), short plain-English bullets, **bold** for headline features, \`code\` for
identifiers, no emojis. Describe only what the commits and files show; do not invent anything.

Reply with exactly this and nothing else:
- line 1: one sentence summarising the release, starting lowercase, tying in the name's meaning
  where it fits naturally (like \"consent that actually holds, and a quieter, faster build.\")
- line 2: empty
- then the sections, separated by lines containing only ---

<previous-release>
$(gh release view --json body --jq .body 2> /dev/null || true)
</previous-release>

<commits since=\"$PREV_TAG\">
$SUBJECTS
</commits>

<files-changed>
$(git diff --stat=200 "$PREV_TAG" "$TAG")
</files-changed>"
    if RESPONSE=$(copilot -p "$PROMPT" -s --no-color --no-ask-user --no-custom-instructions --disable-builtin-mcps); then
        RESPONSE=$(sed '/./,$!d' <<< "$RESPONSE")
    fi
    if [[ $(sed -n 3p <<< "${RESPONSE:-}") == "## "* ]]; then
        SUMMARY=" — $(head -n 1 <<< "$RESPONSE")"
        CHANGES=$(tail -n +3 <<< "$RESPONSE")
    else
        echo "Copilot reply unusable, falling back to the commit list." >&2
    fi
fi

BODY=$(< "$GITHUB_DIR/release-template.md")
for key in ROMAJI_UPPER ROMAJI KANJI MEANING SUMMARY VERSION REPO PREV_TAG TAG CHANGES COMMITS FILES INSERTIONS DELETIONS; do
    case $key in
        ROMAJI_UPPER) value=${ROMAJI^^} ;;
        VERSION) value=${TAG#v} ;;
        *) value=${!key} ;;
    esac
    BODY=${BODY//"{{$key}}"/"$value"}
done

if [[ -n ${DRY_RUN:-} ]]; then
    printf '%s\n\n%s\n' "$TITLE" "$BODY"
    exit 0
fi
gh release create "$TAG" --verify-tag --title "$TITLE" --notes "$BODY"
