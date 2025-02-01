#!/bin/bash

# Exit on error
set -e

# Simple protocol definition
PROTOCOL="icp"
OUTPUT_FILE="./../.env"

#  Note: Alternative implementation with command line argument:
# Commented out for future reference
# PROTOCOL=${1:-icp}
# if [[ ! "$PROTOCOL" =~ ^(icp|near|starknet)$ ]]; then
#     echo "Error: Protocol must be either 'icp', 'near', or 'starknet'"
#     exit 1
# fi

echo "Starting installation process..."

# Check if repository exists, if not clone it
if [ ! -d "demo-blockchain-integrations" ]; then
    echo "Cloning repository..."
    git clone https://github.com/calimero-network/demo-blockchain-integrations.git
fi

# Navigate to the repository
cd demo-blockchain-integrations

# Navigate to logic directory and build
echo "Building logic..."
cd logic
chmod +x ./build.sh
./build.sh

echo "Installing application..."
full_output=$(meroctl --node-name node1 app install -p ./res/blockchain.wasm)
echo "Full command output:"
echo "$full_output"

# Extract the ID
app_id=$(echo "$full_output" | grep "id:" | awk '{print $2}')

# Print the application ID
echo "Application installed successfully!"
echo "Application ID: $app_id"

# Create context and save output
echo "Creating context..."
context_output=$(meroctl --node-name node1 context create --application-id "$app_id" --protocol "$PROTOCOL")
echo "Context creation output:"
echo "$context_output"


# Extract context ID and public key
context_id=$(echo "$context_output" | grep "id:" | awk '{print $2}')
member_public_key=$(echo "$context_output" | grep "member_public_key:" | awk '{print $2}')

# Generate and save identities for node2 and node3
echo "Generating identities for node2 and node3..."

# Generate node2 identity
echo "Generating node2 identity..."
node2_output=$(meroctl --node-name node2 identity generate)
node2_public_key=$(echo "$node2_output" | grep "public_key:" | awk '{print $2}')
node2_private_key=$(echo "$node2_output" | grep "private_key:" | awk '{print $2}')

# Generate node3 identity
echo "Generating node3 identity..."
node3_output=$(meroctl --node-name node3 identity generate)
node3_public_key=$(echo "$node3_output" | grep "public_key:" | awk '{print $2}')
node3_private_key=$(echo "$node3_output" | grep "private_key:" | awk '{print $2}')

# Generate invitation payload for node2
echo "Generating invitation payload for node2..."
invitation_payload_node2=$(meroctl --node-name node1 --output-format json context invite "$context_id" "$member_public_key" "$node2_public_key")
echo "Invitation payload for node2 generated:"
echo "$invitation_payload_node2"

# Generate invitation payload for node3
echo "Generating invitation payload for node3..."
invitation_payload_node3=$(meroctl --node-name node1 --output-format json context invite "$context_id" "$member_public_key" "$node3_public_key")
echo "Invitation payload for node3 generated:"
echo "$invitation_payload_node3"

node2_encoded_invitation=$(echo "$invitation_payload_node2" | jq -r '.data')
node3_encoded_invitation=$(echo "$invitation_payload_node3" | jq -r '.data')

# Use the encoded strings in the join commands
node2_join_output=$(meroctl --node-name node2 context join "$node2_private_key" "$node2_encoded_invitation")
node3_join_output=$(meroctl --node-name node3 context join "$node3_private_key" "$node3_encoded_invitation")

echo "Node2 join output:"
echo "$node2_join_output"
echo "Node3 join output:"
echo "$node3_join_output"

# Save to OUTPUT_FILE file
# TODO: Eventually change member_public_key to host_public_key
echo "Saving configuration to $OUTPUT_FILE file..."
cat > "$OUTPUT_FILE" << EOF
APP_ID=$app_id
CONTEXT_ID=$context_id
MEMBER_PUBLIC_KEY=$member_public_key
PROTOCOL=$PROTOCOL

# Node2 Identity
NODE2_PUBLIC_KEY=$node2_public_key
NODE2_PRIVATE_KEY=$node2_private_key

# Node3 Identity
NODE3_PUBLIC_KEY=$node3_public_key
NODE3_PRIVATE_KEY=$node3_private_key


# Invitation Payloads
NODE2_INVITATION_PAYLOAD='$invitation_payload_node2'
NODE3_INVITATION_PAYLOAD='$invitation_payload_node3'

# Encoded Invitation Payloads
NODE2_ENCODED_INVITATION_PAYLOAD='$node2_encoded_invitation'
NODE3_ENCODED_INVITATION_PAYLOAD='$node3_encoded_invitation'

EOF

echo "Configuration saved to $OUTPUT_FILE file"
