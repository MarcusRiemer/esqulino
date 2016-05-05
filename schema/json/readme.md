# Schema Generation

Having accurate descriptions of public data structures eases debugging and is a prerequiste to provide meaningful API documentation. Thanks to the Typescript client there is some static type information available, but unluckily it takes the form of Typescript definitions.

These Makefiles provide a way to extract those Typescript definitions and stores them as JSON schemas.