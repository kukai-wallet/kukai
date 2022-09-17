# !/bin/bash
# https://developers.cloudflare.com/pages/how-to/build-commands-branches

if [[ "$CF_PAGES_BRANCH" == *-mainnet ]]; then

  echo "Building: Mainnet"
  npm run build-mainnet

elif [[ "$CF_PAGES_BRANCH" == *-prod ]]; then

  echo "Building: Production"
  npm run build-prod

else

  echo "Building: Develop"
  npm run build-dev

fi