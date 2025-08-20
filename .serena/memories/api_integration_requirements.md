# Critical API Integration Requirements

## MANDATORY PROTOCOL - NON-NEGOTIABLE

When building ANY API integration for Ron AI, the following steps are REQUIRED:

1. **NEVER go in blind** - No assumptions, no guessing, no "standard" implementations
2. **NEVER assume** - You are always wrong until proven by official documentation
3. **ALWAYS verify first** using these tools in order:
   - **context7**: Pull official API documentation and specifications
   - **fetch**: Retrieve OpenAPI specs, JSON schemas, and official docs
   - **playwright**: Navigate to live documentation and verify actual behavior

## Why This Matters
- API assumptions lead to broken integrations
- Each API has unique requirements, authentication methods, and quirks
- Official documentation is the ONLY source of truth
- Tim has explicitly stated non-adherence will not be tolerated

## Example Workflow
1. User requests: "Integrate with XYZ API"
2. IMMEDIATELY use context7 to find official docs
3. Use fetch to get OpenAPI/swagger specs
4. Use playwright to verify live examples
5. ONLY THEN start implementation based on verified information

This is a CRITICAL requirement from Tim for the Ron AI project.