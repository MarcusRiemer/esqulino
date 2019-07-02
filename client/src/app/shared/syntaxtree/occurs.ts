import { OccursDescription, OccursSpecificDescription } from './occurs.description';

export * from './occurs.description'

export function resolveOccurs(desc: OccursDescription): OccursSpecificDescription {
  switch (desc) {
    case "*": return ({ minOccurs: 0, maxOccurs: +Infinity });
    case "?": return ({ minOccurs: 0, maxOccurs: 1 });
    case "+": return ({ minOccurs: 1, maxOccurs: +Infinity });
    case "1": return ({ minOccurs: 1, maxOccurs: 1 });
    default: throw new Error(`Unknown occurences: "${JSON.stringify(desc)}"`);
  }
}