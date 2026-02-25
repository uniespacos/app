#!/bin/bash
set -e
# Ensure NVM is available for all future shells
echo 'export NVM_DIR="/home/www/.nvm"' >> /home/www/.bashrc && \
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/www/.bashrc && \
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /home/www/.bashrc

echo 'export PATH="$NVM_DIR/versions/node/v22.0.0/bin:$PATH"' >> /home/www/.bashrc

# Execute the original command
exec bash -c "source /home/www/.bashrc && exec $@"

