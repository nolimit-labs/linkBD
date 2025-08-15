# Best Practices Audit Prompt

## Instructions

Please conduct a comprehensive audit of code files against established best practices. Follow this systematic approach:

### Step 1: Load Best Practices
- Read and understand the specified best practices file thoroughly
- Extract all key rules, patterns, and guidelines 
- Note any specific examples or anti-patterns mentioned

### Step 2: Inventory Files
- List all files in the specified directory/pattern
- Identify file types and their relevance to the best practices
- Group files by type or functionality for systematic review

### Step 3: Systematic Analysis
For each relevant file, check:
- **Imports/Dependencies**: Are they following naming conventions and patterns?
- **Function/Component Structure**: Do they match the prescribed organization?
- **Naming Conventions**: Are variables, functions, and exports properly named?
- **Code Organization**: Are sections properly commented and structured?
- **Pattern Adherence**: Are established patterns (like model imports, authentication flows, etc.) being followed?
- **Anti-Patterns**: Are there any violations of explicit "don't do this" rules?

### Step 4: Categorize Findings
Report findings in these categories:
1. **✅ Compliant Files**: Files that fully follow best practices
2. **⚠️ Minor Issues**: Files with small deviations that should be fixed
3. **❌ Major Violations**: Files that significantly violate best practices
4. **🤔 Unclear/Questionable**: Files where best practice application is ambiguous

### Step 5: Detailed Report
For each non-compliant file, provide:
- **File path**
- **Specific violations** (with line numbers if applicable)
- **Expected pattern** according to best practices
- **Suggested fix** (brief description)

### Step 6: Follow-up Questions
Ask clarifying questions about:
- Any ambiguous best practice interpretations
- Files that don't clearly fit the established patterns
- Potential edge cases or exceptions
- Missing best practices for patterns you observed

### Step 7: Summary
Provide a high-level summary including:
- Total files reviewed
- Compliance percentage 
- Most common violations
- Priority recommendations for fixes

## Usage Template

```
@best-practices-audit

Please audit the files in [DIRECTORY/PATTERN] against the best practices in [BEST_PRACTICES_FILE].

[Optional: Any specific focus areas or concerns]
```

## Example Usage

```
@best-practices-audit

Please audit all Convex files in `apps/backend/convex/*.ts` against the best practices in `3.2_convex_best_practices.mdc`.

Focus particularly on model import patterns and function organization.
``` 