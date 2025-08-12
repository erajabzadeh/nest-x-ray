import { tags } from 'typia';

export type ObjectId = string & tags.Pattern<'^[0-9a-fA-F]{24}$'>;
