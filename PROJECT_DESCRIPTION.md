# Bitbucket Pipelines MCP

## Project Overview

Bitbucket Pipelines MCP is a Model Context Protocol (MCP) server that provides tools for interacting with Bitbucket Pipelines. This server implements the MCP standard, enabling language models like Claude to manage Bitbucket Pipelines through a standardized interface.

## Key Features

- **Pipeline Management**: List, trigger, monitor, and stop Bitbucket Pipelines
- **MCP Compliance**: Fully implements the Model Context Protocol for seamless AI integration
- **Docker Support**: Run as a containerized service for easy deployment
- **Cursor IDE Integration**: Direct integration with Cursor IDE for developer productivity
- **TypeScript Implementation**: Type-safe codebase with modern JavaScript features

## Available Tools

The server exposes four primary tools to interact with Bitbucket Pipelines:

1. **List Pipelines**: Retrieve a paginated list of pipelines with filtering options
2. **Trigger Pipeline**: Start a new pipeline execution with custom targets and variables
3. **Get Pipeline Status**: Check the current status and details of a specific pipeline
4. **Stop Pipeline**: Halt a running pipeline execution

## Technical Implementation

Built with TypeScript and Node.js, the server leverages the MCP SDK to provide a standardized interface between language models and the Bitbucket Pipelines API. The architecture follows a modular design, with clean separation between the protocol handling and the Bitbucket API integration.

## Use Cases

- **CI/CD Automation**: Control pipeline executions programmatically
- **AI-assisted DevOps**: Enable AI assistants to help with deployment workflows
- **Status Monitoring**: Track pipeline statuses through natural language interfaces
- **Development Workflow Integration**: Seamlessly integrate pipeline management into developer tools

## Getting Started

The server can be quickly deployed using Docker, requiring minimal configuration through environment variables for Bitbucket authentication. It can be accessed through the MCP client SDK or directly via the Cursor IDE for an integrated development experience.

## Target Audience

This tool is designed for developers and DevOps engineers working with Bitbucket Pipelines who want to leverage AI assistants or build integrations with their development workflows.

---

*Bitbucket Pipelines MCP bridges the gap between language models and CI/CD infrastructure, enabling a new generation of AI-assisted development workflows.* 