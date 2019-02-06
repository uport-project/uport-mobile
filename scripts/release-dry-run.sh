GREN_GITHUB_TOKEN="$(vault read -field=value secret/mobile/release_token)"
CHANGELOG_GITHUB_TOKEN="$(echo ${GREN_GITHUB_TOKEN})"

echo $CHANGELOG_GITHUB_TOKEN
