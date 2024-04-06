import { JSONSchema4 } from 'json-schema';

export const selectedRowSchema: JSONSchema4 = {
    type: 'object',
    properties: {    
        recordId : {type: 'string'},                 
        recordDate :  { type: 'string' },        
        recordValue: { type: 'number' },
        parentId: { type: 'object', properties: {
            id: { type: 'string'},
            name: { type: 'string'},
            etn : { type: 'string'}
            }               
        }
    }
};

export type TSelectedRow = {
    recordId: string;
    recordDate: string;    
    recordValue: number;
    parentId ?: {
        id: string,        
        name: string,
        etn: string
    }    
}