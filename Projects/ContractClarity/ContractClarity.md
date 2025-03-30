# ContractClarity Project Structure

The ContractClarity project employs a hierarchical work item structure and adheres to the [Product-driven Agile](../Implementations/Product-driven-agile.md) methodology.

This structure serves dual purposes:
1. A project management framework
2. A knowledge repository

It goes beyond mere alignment with Azure DevOps best practices.Instead, it fosters a shared mental model across the organization.

This approach offers several benefits:
- Accelerates onboarding
- Enhances cross-team understanding
- Establishes a unified product vision

New team members can quickly comprehend:
- The "what" of the project
- The "why" behind decisions
- How it connects to broader objectives

As a living document, this structure evolves alongside the product.
This ensures all stakeholders maintain a consistent understanding of:
- Priorities
- Dependencies
- The overall product roadmap

## Key Demonstrations

- Team ownership of specific areas (e.g., X-Force with Contract Explorer)
- Shared service teams supporting product teams (e.g., DART supporting X-Force on AI features)
- Platform dependencies (Node upgrade affects all teams)
- Release planning (tasks show sequence and dependencies)
- Cross-team collaboration (shared ownership of features)

## Teams

Each team will need to own an area of the product. However, teams that serve as shared services may need to own multiple areas as a result of supporting multiple areas of the product

- Blue Fusion - This team focuses on product platform, without an assigned area
- Transformers - This team focuses on product platform, without an assigned area
- Ctrl-Alt-Elite - This team focuses on product platform, without an assigned area
- TTRN - This team focuses on product platform, without an assigned area
- Top Secret - This team focuses on product platform, without an assigned area
- X-Force - This team focuses on product platform, without an assigned area
- Ninjas - This team focuses on DevOps and serves as a shared service to support the Product Teams
- Zamboni Mafia - This team focuses on Platform Architecture and serves as a shared service to support the Product Teams
- DART - This team focuses on Data & AI, Research & Tooling and serves as a shared service to support the Product Teams


## EPICS

### Epic 1: Platform Modernization
**Owner:** Zamboni Mafia (Platform Architecture)

*Description:* Upgrade core platform infrastructure to support new features and improve performance

### Epic 2: Contract Management Enhancement
**Owner:** X-Force (Product Team)

*Description:* Expand Contract Explorer capabilities with advanced AI features and improved UX

### Epic 3: Analytics Dashboard Refresh
**Owner:** Blue Fusion (Product Team)

*Description:* Redesign analytics dashboard with expanded metrics and visualization tools

### Epic 4: Supplier Management Optimization
**Owner:** Transformers (Product Team)

*Description:* Enhance supplier management capabilities with improved performance tracking and diversity metrics

## FEATURES

### Under Epic 1: Platform Modernization

- **Feature 1.1:** Node.js v14 to v20 Upgrade (Zamboni Mafia)
- **Feature 1.2:** API Gateway Modernization (Zamboni Mafia)
- **Feature 1.3:** Authentication System Redesign (Ninjas - DevOps)

### Under Epic 2: Contract Management Enhancement

- **Feature 2.1:** AI-Powered Contract Analysis (X-Force with DART support)
- **Feature 2.2:** Batch Contract Processing (X-Force)
- **Feature 2.3:** Automated Clause Identification (X-Force with DART support)

### Under Epic 3: Analytics Dashboard Refresh

- **Feature 3.1:** Spend Analysis Dashboard (Blue Fusion)
- **Feature 3.2:** Custom Reporting Engine (Blue Fusion with DART support)
- **Feature 3.3:** Data Visualization Tools (Blue Fusion)

### Under Epic 4: Supplier Management Optimization

- **Feature 4.1:** Supplier Performance Metrics (Transformers)
- **Feature 4.2:** Diversity Spend Tracking (Transformers)
- **Feature 4.3:** Supplier Onboarding Automation (Transformers with Ninjas support)

## USER STORIES

### Under Feature 1.1: Node.js Upgrade

1. As a developer, I need the development environment updated to Node v20 to use modern JavaScript features
2. As a platform engineer, I need to update build pipelines to support Node v20
3. As a QA tester, I need testing environments that match production Node version

### Under Feature 2.1: AI-Powered Contract Analysis

1. As a procurement manager, I want to automatically extract key terms from uploaded contracts
2. As a legal reviewer, I want AI-suggested improvements for contract clauses
3. As a business user, I want contract summaries generated automatically upon upload
4. As a system admin, I need to configure AI analysis parameters for different contract types

### Under Feature 2.3: Automated Clause Identification

1. As a procurement manager, I want the system to flag non-standard contract clauses
2. As a legal reviewer, I want similar clauses from different contracts to be grouped together
3. As a risk manager, I want automatic identification of high-risk contract terms

## TASKS

### Under User Story 2.1.1: Extract key terms from contracts

1. Design machine learning model for term extraction (DART)
2. Develop UI for displaying extracted terms (X-Force)
3. Create API endpoint for term extraction service (X-Force)
4. Implement data storage for extracted terms (X-Force)
5. Train ML model on contract corpus (DART)
6. Integrate extraction service with Contract Explorer (X-Force)
7. Create automated tests for term extraction (X-Force/QA)

### Under User Story 1.1.1: Update development environment

1. Document Node v20 migration requirements (Zamboni Mafia)
2. Update package.json files across repositories (Zamboni Mafia)
3. Test application functionality with Node v20 (QA)
4. Fix deprecated API usage in codebase (Zamboni Mafia)
5. Update Docker containers for development (Ninjas)
6. Create developer documentation for Node v20 features (Zamboni Mafia)


## Implementation Plan

1. **Create Product Areas**
2. **Create Teams**
3. **Assign Teams to their areas**
4. **Create Sprints**
5. **Create Epics**
6. **Create Features**
7. **Create User Stories**
8. **Create Tasks**
9. **Link dependent work items**