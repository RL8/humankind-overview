# PRD: Course Tracker - Collaborative Training Program Management Platform

## 1. Executive Summary

**Product Name**: Course Tracker

**Vision**: A collaborative training program authorship and translation platform for internal content creators and external clients, enabling seamless content management, client customization, and multi-language workflows.

**Problem Statement**: 
- **Internal Challenge**: Mindstretchers Ltd. needs efficient collaboration between composers and principals during training program creation and translation
- **Client Challenge**: Corporate clients worldwide want to be engaged and provide feedback during the authorship process
- **Content Management Challenge**: No centralized system to manage training program content, adapt/repurpose content for different clients, or handle multiple language versions
- **Translation Challenge**: Manual translation workflows between English and multiple languages (Dutch, French, Simplified Chinese) are time-consuming and error-prone

**Solution**: A centralized platform that enables internal team collaboration, client engagement during authorship, content adaptation for different clients, and automated translation workflows.

---

## 2. About Us

**Company**: Mindstretchers Ltd.
**Business**: Create online training experiences for corporate clients worldwide
**Current Pain Points**:
- Fragmented training program creation process
- Manual translation and content adaptation
- Limited client engagement during development
- No centralized content management
- Difficulty repurposing content for different clients

---

## 3. Product Goals

**Primary Goals**:
- Centralize training program content management for internal team
- Enable client engagement and feedback during authorship
- Streamline content adaptation and repurposing for different clients
- Automate translation workflows for multiple languages
- Improve collaboration between composers and principals

**Success Metrics**:
- 50% reduction in training program creation time
- 90% client satisfaction with engagement process
- 80% reduction in translation workflow time
- 100% content reusability across client projects

---

## 4. Target Users

### Internal Users

**Lead Composers**:
- Create new training programs from scratch
- Auto-generate file structure based on agreed template with empty folders as guidance
- Upload relevant MD files to populate the structure
- Add relevant team members to appropriate roles (composers, principals)
- Manage the entire training program from creation to completion
- Oversee content creation process
- Review and approve composer edit requests
- Implement approved changes
- Submit content for principal and/or client manager approval
- Manage translation workflows

**Composers**:
- Create and edit training program content based on principal instructions
- Handle source document management
- Apply client customizations
- Manage translation workflows
- Implement edit requests from reviewers

**Principals**:
- Give final approval on all content changes
- Read-only access to all content
- Comment and request edits via PR system
- Maintain quality and brand standards
- One principal per training program

### External Users

**Client Team Members**:
- View training program content
- Comment on content during development
- Provide feedback and suggestions
- Read-only access to all content

**Client Managers**:
- Give final approval on client side
- Re-approve content after any edits
- Make final decisions on client customizations
- Read-only access with approval authority

**User Count**: 10-15 internal users, 50-100 client users

---

## 5. Core Features

### Content Management
- Centralized training program content repository
- Multi-language support (English, Dutch, French, Simplified Chinese)
- Content versioning and history
- Client-specific content adaptation
- Source document management
- Asset management (logos, images, documents)

### Collaboration
- Lead Composer management of multiple composers
- Principal approval workflow
- Client engagement and feedback system
- Pull request workflow for content changes
- Real-time commenting and review
- User role management and permissions

### Translation & Localization
- Automated translation with DeepL API
- Translation memory and consistency
- Client-specific content customization
- Export to multiple formats
- English-only editing with auto-translation
- Translation queue and status tracking

### Client Customization
- Client-specific workspaces and theming
- Placeholder system for branding and content
- Client insight guide integration
- Multi-level customization (minor/major adaptations)
- Asset management per client

---

## 6. User Workflows

### Lead Composer Workflow
1. Create new training program from scratch
2. Auto-generate file structure with template guidance
3. Upload relevant MD files
4. Add team members to appropriate roles
5. Manage content creation process
6. Review and approve composer edit requests
7. Implement approved changes
8. Submit content for principal and/or client manager approval
9. Manage translation workflows

### Principal Workflow
1. Review training program content
2. Comment and request edits via PR system
3. Give final approval on content quality
4. Maintain accountability for training program

### Client Team Workflow
1. View training program content
2. Comment on content during development
3. Provide feedback and suggestions
4. Read-only access to all content

### Client Manager Workflow
1. View training program content
2. Give final approval on client side
3. Re-approve content after any edits
4. Make final decisions on client customizations

### Approval Sequence
**Lead Composer → Principal and/or Client Manager**
- Client Manager can see content before Principal approves
- Client Manager can approve before Principal
- Both Principal and Client Manager can approve independently
- Lead Composer manages the workflow and implements changes

---

## 7. Content Structure

### Training Program Hierarchy
- Training Program > Course > Module > Unit
- Single MD file per training program per language
- Client-specific adaptations with placeholder system
- Source document management per training program

### File Organization
```
training-programs/
├── base/floorbook-approach/
│   ├── content-grids/
│   │   ├── en/floorbook-approach-en.md
│   │   ├── nl/floorbook-approach-nl.md
│   │   ├── fr/floorbook-approach-fr.md
│   │   └── zh/floorbook-approach-zh.md
│   ├── source-documents/
│   │   ├── brandbook.pdf
│   │   ├── vision-policy.pdf
│   │   └── floorbook-approach.pdf
│   ├── assets/
│   │   ├── images/
│   │   │   ├── mindstretchers-logo.png
│   │   │   └── default-branding/
│   │   ├── documents/
│   │   └── media/
│   └── metadata/
│       ├── training-program-info.yaml
│       ├── i18n-variables.yaml
│       └── client-placeholders.yaml
├── clients/
│   ├── humankind/
│   │   └── floorbook-approach/
│   │       ├── content-grids/
│   │       │   ├── en/floorbook-approach-en.md
│   │       │   └── nl/floorbook-approach-nl.md
│   │       ├── assets/
│   │       │   ├── images/
│   │       │   │   ├── acme-logo.png
│   │       │   │   └── acme-branding/
│   │       │   └── documents/
│   │       └── metadata/
│   │           ├── client-adaptation.yaml
│   │           └── client-placeholders.yaml
│   └── beta-company/
│       └── floorbook-approach/
└── client-insights/
    ├── acme-corp-guide.md
    └── beta-company-guide.md
```

### i18n Variable System
**i18n-variables.yaml** - Stores translated variables for each language:
```yaml
en:
  course_title: "Floorbook Approach"
  course_subtitle: "Complete Learning Series"
  module_title: "Foundations of Inquiry-Based Learning"
  case_study_title: "Generic Case Study"
  example_title: "Generic Example"
  company_name: "Mindstretchers Ltd"

nl:
  course_title: "Floorbook Aanpak"
  course_subtitle: "Volledige Leerserie"
  module_title: "Grondslagen van Onderzoekgericht Leren"
  case_study_title: "Generieke Casestudy"
  example_title: "Generiek Voorbeeld"
  company_name: "Mindstretchers Ltd"
```

**client-placeholders.yaml** - Stores client-specific customizations:
```yaml
acme-corp:
  course_title: "Acme Leadership Development"
  course_subtitle: "Floorbook Approach for Manufacturing"
  company_name: "Acme Corporation"
  company_logo: "acme-logo.png"
  brand_colors: "Red and White"
```

### Content Editing Rules
- All edits made on English version only
- Other languages auto-translate from English changes
- Comments on non-English versions restricted to translation issues only
- Placeholder system: `{{course_title}}`, `{{company_logo}}`, etc.

---

## 8. Technical Requirements

### Architecture
- **Frontend**: React/Next.js web application
- **Backend**: Node.js/Express API server
- **Database**: SQLite for simplicity
- **Translation**: DeepL API integration
- **File Storage**: Local or cloud-based file system
- **Hosting**: Cloud platform (TBD)

### Database Schema
- **Users**: User management, roles, permissions
- **Training Programs**: Program metadata, versions, status
- **Client Adaptations**: Client-specific customizations
- **Translations**: Translation memory, status tracking
- **Comments**: User comments and feedback
- **Assets**: File references and metadata

### API Endpoints
- **Authentication**: Login, logout, user management
- **Training Programs**: CRUD operations, version control
- **Translation**: DeepL API integration, translation management
- **Client Management**: Client workspaces, customizations
- **File Management**: Upload, download, version control
- **Comments**: Comment system, notifications

### User Interface
- **Dashboard**: Role-based navigation and overview
- **File Editor**: MD editor with placeholder support
- **Comment System**: Highlight text and add comments
- **Client Portal**: Read-only client interface
- **Translation Interface**: Translation management and review
- **Asset Management**: Upload and organize media files

---

## 9. Success Criteria

### Must Have
- Composers can create and edit training programs
- Principals can review and approve content
- Clients can view and comment on content
- Changes go through PR workflow
- Export to existing markdown format
- Automated translation to all supported languages
- Client-specific customization system
- Asset management for logos and media

### Should Have
- Real-time notifications
- Translation memory
- Client-specific theming
- Bulk operations
- Advanced file management
- User role management

### Could Have
- Additional language support
- Advanced analytics
- Mobile app
- Advanced workflow automation

---

## 10. Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- Set up development environment
- Create basic file management system
- Implement user authentication and roles
- Build basic MD file editor

### Phase 2: Translation System (Weeks 3-4)
- Integrate DeepL API
- Implement placeholder system
- Create translation workflow
- Build i18n variable management

### Phase 3: Collaboration Features (Weeks 5-6)
- Build PR system for content changes
- Implement comment system
- Create client portal
- Add notification system

### Phase 4: Client Customization (Weeks 7-8)
- Build client workspace system
- Implement asset management
- Create client-specific theming
- Add client insight guide integration

### Phase 5: Polish and Deployment (Weeks 9-10)
- User interface polish
- Testing and bug fixes
- Deploy to hosting platform
- User training and documentation

---

## 11. Risk Assessment

### Technical Risks
- **DeepL API limitations**: Translation quality and rate limits
- **File synchronization**: Managing multiple language versions
- **Performance**: Large file handling and real-time collaboration

### Business Risks
- **User adoption**: Learning curve for new system
- **Client satisfaction**: Meeting client expectations
- **Development timeline**: Feature creep and scope changes

### Mitigation Strategies
- **API testing**: Validate DeepL integration early
- **User training**: Comprehensive onboarding process
- **Phased rollout**: Start with internal users, then clients
- **Regular feedback**: Continuous improvement based on user input

---

## 12. Future Enhancements

### Short Term (3-6 months)
- Additional language support
- Advanced translation management
- Enhanced client customization options
- Mobile-responsive interface

### Long Term (6-12 months)
- Advanced analytics and reporting
- Integration with external LMS platforms
- Advanced workflow automation
- API for third-party integrations

---

**This PRD provides a comprehensive foundation for developing the Course Tracker platform while maintaining focus on the core mission of MD file management with enhanced collaboration and translation capabilities.**

