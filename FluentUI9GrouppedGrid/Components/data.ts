import { Children } from "react";
import { IInputs, IOutputs } from "../generated/ManifestTypes";
export function addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function formateDate(date: Date, context: ComponentFramework.Context<IInputs>): string {
    return context.formatting.formatDateAsFilterStringInUTC(date, false);
}


export type TGroup = {    
    [key: string]: {id: string, name:  string, children: any[]};
}

export type TGroupsExpanded = {
    [key: string] : boolean;    
}

export type TData = {
    sortedGroups: string[]; //projectAssignmentId[] 
    groups: TGroup;//{projectAssignmentId: TGroup[]}
}


export function parseDataset(dataset: ComponentFramework.PropertyTypes.DataSet, context: ComponentFramework.Context<IInputs>): TData {
  
    return dataset.sortedRecordIds.reduce((data: TData, id:string, index: number) => {
        const item = dataset.records[id];
        const parentId = (item.getValue("diana_projectid") as ComponentFramework.EntityReference);
                
        const groupFound = data.groups[parentId?.id?.guid];
        if(!groupFound){
            data.sortedGroups.push(parentId?.id?.guid);        
            data.groups[parentId?.id?.guid] = {id: parentId?.id?.guid, name: parentId?.name, children : [item]};
        }
        else{
            groupFound.children.push(item);
        }       
        return data;
    }, {
        sortedGroups: [],
        expandedGroups: {},
        groups: {}
    } as TData);

    
}


export function filterDataset(dataset: ComponentFramework.PropertyTypes.DataSet, from: string, to: string, context: ComponentFramework.Context<IInputs>) {
    return; 
    /*dataset.filtering.clearFilter();
    const conditions : ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression[] = [{
            attributeName: "diana_date",
            conditionOperator: 4, //greater or equal
            value: from + "T00:00:00Z"
        },
        {
            attributeName: "diana_date",
            conditionOperator: 5, //less or equal
            value: to + "T00:00:00Z"
        }]; 
    dataset.filtering.setFilter({
        filterOperator: 0, //and
        conditions: conditions
        
    });   
    dataset.refresh();
    */
}

export function getSortedColumnsOnView(columns: ComponentFramework.PropertyHelper.DataSetApi.Column[], excludeColumns: string[]): ComponentFramework.PropertyHelper.DataSetApi.Column[] {    
    const columns1 = columns.filter((columnItem) => {
            // some column are supplementary and their order is not > 0
            return columnItem.order >= 0 && !excludeColumns.includes(columnItem.alias) && !excludeColumns.includes(columnItem.name);
        });

    // Sort those columns so that they will be rendered in order
    return columns1.sort((a, b) => {
        return a.order - b.order;
    });
}
