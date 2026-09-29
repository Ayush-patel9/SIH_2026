---
name: emergent-ui-refiner
description: Guides the agent on how to use the Emergent MCP server (https://mcp.emergent.sh/) to prototype, preview, and iteratively refine UI components for the ManakAI frontend.
---

# Emergent MCP UI Refinement Workflow

This skill outlines how to orchestrate the **Emergent MCP connector** (`emergent`) to build, test, and refine UI components for this repository.

## Emergent MCP Tools Reference

When the `emergent` MCP server is connected, the following tools are available:

1. **`emergent.create_job(prompt: str)`**:
   Initializes an app build or UI prototyping job in Emergent's cloud environment.
2. **`emergent.wait_for_job(job_id: str)`**:
   Waits for the job to complete or for Emergent to request clarification.
3. **`emergent.get_job_preview(job_id: str)`**:
   Retrieves the live web URL of the hosted application preview.
4. **`emergent.send_message(job_id: str, message: str)`**:
   Sends refinement instructions, CSS adjustments, or feedback to the Emergent agent.
5. **`emergent.get_job_status(job_id: str)`**:
   Checks whether the build is active, finished, or errored.

---

## UI Standards to Inject

When creating or modifying jobs in Emergent for this project, always ground the prompts in the **ManakAI Design System** defined in `interface/ideas/frontend.md`:

- **Design Philosophy**: Government institutional grade, high density, anti-AI-gimmick.
- **Color Tokens**:
  - `--paper`: `#EEF0F4` (background canvas)
  - `--surface`: `#FFFFFF` (card surfaces)
  - `--ink`: `#161A22` (primary typography)
  - `--hairline`: `#D0D4DC` (1px dividers)
  - `--collapse-cobalt`: `#1B4FE0` (confirmed/active standards)
  - `--superposition-violet`: `#6E5AD6` (reasoning steps/drafts)
- **Typography**:
  - Headings/Prose: `Literata` (serif)
  - Data/Tables/IS codes: `JetBrains Mono` (monospace)
- **Component targets**:
  - High-density 2-column layout (Main Working Stage + Right Authority Stream).

---

## Step-by-Step Execution Loop

1. **Initiate Prototyping**:
   - Call `emergent.create_job` with the component spec and design tokens.
2. **Retrieve Live Preview**:
   - Wait for completion with `emergent.wait_for_job`.
   - Call `emergent.get_job_preview` and present the live URL to the user.
3. **Iterative Refinement**:
   - Collect user feedback and call `emergent.send_message`.
4. **Integrate into Local Codebase**:
   - Retrieve the resulting React/Vite code and integrate it into `application/frontend/src/`.
