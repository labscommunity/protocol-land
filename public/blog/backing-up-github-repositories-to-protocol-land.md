---
title: 'Backing up GitHub repositories to Protocol.Land'
status: 'published'
author:
  name: 'Rohit Pathare'
  avatar: 'https://avatars.githubusercontent.com/u/50047129?v=4'
  twitter: 'https://twitter.com/ropats16'
slug: 'backing-up-github-repositories-to-protocol-land'
category: 'EDUCATION'
description: "Effortlessly backup GitHub repositories on Protocol.Land, a decentralized code collaboration platform built atop Arweave ensuring permanent, verifiable backups."
coverImage: '/blog/images/backing-up-github-repositories-to-protocol-land.png'
transparentThumbnail: 'https://u2hyhgglc4egidq3zkthnzdruyatqwql5lk5foen3zv5zf5fo2wa.arweave.net/po-DmMsXCGQOG8qmduRxpgE4Wgvq1dK4jd5r3Jeldqw'
themeColor: 'rgba(0, 0, 0, .15)'
publishedAt: '2024-03-11'
---

[Protocol.Land](https://protocol.land/?utm_source=Protocol.Land+Blog&utm_medium=Post&utm_campaign=Backing+up+GitHub+repositories+to+Protocol.Land&utm_id=Backing+up+GitHub+repositories+to+Protocol.Land), a decentralized source control and code collaboration protocol built on Arweave, offers a robust solution for safeguarding your code repositories. Arweave's architecture ensures a minimum of 20 backups for each repository, securely stored for at least 200 years. This makes Protocol.Land an ideal choice for backing up code bases, especially when centralized platforms are susceptible to issues like outages and censorship.

## Backing up GitHub repositories to Protocol.Land with GitHub actions

This step-by-step guide walks you through the steps to seamlessly back up your GitHub repositories on Protocol.Land through GitHub Actions. By setting up a workflow action within your selected repository, you can automate the import and synchronization of your codebase on Protocol.Land.

### *1. Setting up Arweave Wallet*

To enable interaction with the Arweave network and facilitate the backing up of the repository on Arweave through Protocol.Land, you must first add your Arweave wallet key to GitHub action secrets:

- Navigate to your GitHub repository and go to the "Settings" tab. 
- Under "Secrets and variables," select "Actions" and then click "New Repository Secret."
- Add a new secret with "Name" as “WALLET”, paste your Arweave wallet's JWK into the "Secret" field, and click "Add secret."

### *2. Creating a new Workflow*

The next step is creating a new GitHub Actions workflow as follows:

- Go to the "Actions" tab.
- When setting up an action for the first time in the repository, you will be directed to the "Get started with GitHub Actions" page. Otherwise, click "New workflow" to navigate to the "Choose a workflow" page.
- Select "Set up a workflow yourself."
- Copy and paste the following YAML code into the .yml file, then commit the changes:

```yaml
name: Protocol Land Sync
on:
    # Run with every push to 'main' branch:
    push:
        branches:
            - 'main'
    # Run Manually:
    #workflow_dispatch:
jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - name: 'Checkout repo (default branch)'
              uses: actions/checkout@v3
              with:
                  # fetch all history for all branches:
                  fetch-depth: 0
            - name: 'Checkout all branches'
              run: |
                  default_branch=$(git branch | grep '*' | sed 's/\* //')
                  for abranch in $(git branch -a | grep -v HEAD | grep remotes | sed "s/remotes\/origin\///g"); do git checkout $abranch ; done
                  git checkout $default_branch
                  git branch -a
            - name: 'Setup node 18'
              uses: actions/setup-node@v3
              with:
                  node-version: 18.x
            - name: 'Sync repo to Protocol Land'
              run: npx @protocol.land/sync
              env:
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                  REPO_TITLE: ${{ github.event.repository.name }}
                  REPO_DESCRIPTION: ${{ github.event.repository.description }}
                  WALLET: ${{ secrets.WALLET }}
```

### *3. Running the Workflow*

The GitHub Action code defined in Step 2 is set to run automatically on every push to the 'main' branch. To run it manually, comment out the lines after "on:" and uncomment the "workflow_dispatch:" line.

You can comment out the entire 'Checkout all branches' section if you only want to sync the main branch.

With this setup, your GitHub repository will now be seamlessly backed up to Protocol.Land using GitHub Actions.

## Backup your repositories today

By backing up your repository on Protocol.Land, you ensure a permanent, immutable backup with uninterrupted access. The successive updates to this backup are verifiably recorded on Arweave, maintaining the integrity of your codebase. With Arweave's guarantee of 20+ backups, the need for complex custom backup solutions on multiple platforms is eliminated.

Worried you might face an outage or be censored and lose access to your codebase? You can start backing up repositories on [Protocol.Land](https://protocol.land/?utm_source=Protocol.Land+Blog&utm_medium=Post&utm_campaign=Backing+up+GitHub+repositories+to+Protocol.Land&utm_id=Backing+up+GitHub+repositories+to+Protocol.Land) today. Simply join our [Discord](https://discord.gg/3ntP5pRcdg) and request access in the #get-access channel to be an early user.