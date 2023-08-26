# Test script for zkGraph

# Update `config.js` with your own parameters first!
# Then run `sh test.sh`
unset http_proxy && unset https_proxy

npm run compile-local &&
npm run exec-local -- 17990782 &&
npm run prove-local -- --inputgen 17990782 0000000000000000000000000000000000000000000000000000000270ac0e14 &&
npm run prove-local -- --test 17990782 0000000000000000000000000000000000000000000000000000000270ac0e14

npm run setup-local &&
npm run prove-local -- --prove 17990782 0000000000000000000000000000000000000000000000000000000270ac0e14