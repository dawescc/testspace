#!/bin/bash

# Get the current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Get the latest tag from the current branch
latest_tag=$(git describe --tags --abbrev=0 origin/$current_branch)

# Split the latest tag into its components
IFS='.' read -ra tag_parts <<< "${latest_tag//v/}"

echo "Latest tag: v${tag_parts[0]}.${tag_parts[1]}.${tag_parts[2]}"

# Prompt for the interval
read -p "Enter the interval (in x.y.z format): " interval
IFS='.' read -ra interval_parts <<< "$interval"

# Calculate the new tag
new_major=$((tag_parts[0] + interval_parts[0]))
new_minor=$((tag_parts[1] + interval_parts[1]))
new_patch=$((tag_parts[2] + interval_parts[2]))

# Check if the tag is a beta version
read -p "Is this a BETA release? (y/n): " is_beta

if [[ $is_beta == "y" ]]; then
  new_tag="v$new_major.$new_minor.$new_patch-beta"
else
  new_tag="v$new_major.$new_minor.$new_patch"
fi

# Prompt for the message
read -p "Enter the message (default: \"$new_tag created\"): " message
message=${message:-"$new_tag created"}

# Display the summary and ask for confirmation
echo "Summary:"
echo "New tag: $new_tag"
echo "Message: $message"
read -p "Confirm? (y/n): " confirm

if [[ $confirm == "y" ]]; then
  # Create the tag with the specified message
  git tag -a "$new_tag" -m "$message"

  # Push the new tag to the origin
  git push origin "$new_tag"
  echo "New tag pushed to the origin."
else
  echo "Operation canceled."
fi
