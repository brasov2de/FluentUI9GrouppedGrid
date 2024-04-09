import * as React from "react";
import {ChevronDown24Filled, ChevronRight24Filled ,ReOrderDotsVertical24Regular, EditFilled, EditRegular, bundleIcon} from "@fluentui/react-icons";
import { Input, SpinButton, Table, TableBody, TableCell, TableHeader, TableRow, Theme, Text, makeStyles, TableHeaderCell, TableCellLayout, 
useFocusableGroup, useArrowNavigationGroup, FluentProvider, TableCellActions, Button} from "@fluentui/react-components";
import { TData, TGroup, TGroupsExpanded, filterDataset, getSortedColumnsOnView, parseDataset } from "./data";
import { IInputs } from "../generated/ManifestTypes";
import { TSelectedRow } from "./outputSchema";
//import { TSelectedCell } from "../outputSchema";



const useStyles = makeStyles({
        container: {      
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch"
        },
});

export interface IGroupedGridProps {
    dataset : ComponentFramework.PropertyTypes.DataSet;
    theme ?: Theme;
    from : string;
    to : string;
    setSelectedRow : (selectedRow: TSelectedRow) => void;
    refresh ?: string | null;
    context: ComponentFramework.Context<IInputs>
}

const GroupedGridRaw = ({dataset, theme, from, to, context,  refresh, setSelectedRow} : IGroupedGridProps) => {
    const styles=useStyles();
    const keyboardNavAttr = useArrowNavigationGroup({ axis: "grid" });
   /* const focusableGroupAttr = useFocusableGroup({
        tabBehavior: "limited-trap-focus",
    });*/


    const [data, setData] = React.useState<TData>({sortedGroups: [], groups: {}});
    const [columns, setColumns] = React.useState<ComponentFramework.PropertyHelper.DataSetApi.Column[]>(getSortedColumnsOnView(dataset.columns, ["parentId","diana_projectid"]))
    const [expandedGroups, setExpandedGroups] = React.useState<TGroupsExpanded>({});

    React.useEffect(() => {
        if(dataset.loading || dataset.filtering.getFilter()==null ) return;
        const dataTmp =  parseDataset(dataset, context);
        setData(dataTmp);
        setColumns(getSortedColumnsOnView(dataset.columns, ["parentId", "diana_projectid"]));
        setExpandedGroups(dataTmp.sortedGroups.reduce((acc, key) => {acc[key] = true; return acc;}, {} as TGroupsExpanded));        
    }, [dataset, dataset.loading]);


    React.useEffect(() => {      
        //todo, how about when the userid changes
        filterDataset(dataset, from, to, context);
    }, [from, to]);
    React.useEffect(() => {
        if(refresh!=null){      
            dataset.refresh();
        }
    }, [refresh]);
      

    return (
        <div style={{ width: "100%" , overflow: "scroll"}}>
        <FluentProvider theme={theme}>
        <Table aria-role="grid" role="grid" {...keyboardNavAttr}>            
            <TableHeader>
                <TableRow>
                    <TableHeaderCell style={{width: "50px"}} key="action" >&nbsp;                        
                    </TableHeaderCell>                    

                    <TableHeaderCell className={styles.container} key="groupby" >
                        <Text align="start">Project / Name </Text>
                    </TableHeaderCell>                  
                    {columns.map((column, index)=> {
                        if(index==0) return null;
                        return (<TableHeaderCell key={column.name} >
                            <Text align="end">{column.displayName}</Text>
                        </TableHeaderCell>)
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
              
                    
            {data.sortedGroups.map((parentId) => {                
                const group = data.groups[parentId];
                const childRows = data.groups[parentId]?.children ?? [];
                const expanded = expandedGroups[parentId] != false;
                const onExpand = () => {
                    setExpandedGroups({...expandedGroups, [parentId]: !expanded});
                }
                return (
                    <>
                    <TableRow appearance="neutral" key={parentId}>
                        <TableCell key="action">
                            <TableCellLayout media={expanded ? <ChevronDown24Filled /> : <ChevronRight24Filled/>} onClick={onExpand}/>
                        </TableCell>                               
                        <TableCell className={styles.container} key="groupby">
                            <TableCellLayout appearance="primary" description={group.name} >
                                <Text weight="bold" align="start"></Text> 
                            </TableCellLayout>
                        </TableCell>                      
                        {columns.map((column: ComponentFramework.PropertyHelper.DataSetApi.Column, index: number)=> {
                            if(index==0) return null;
                            return (
                                <TableCell key={column.name} width={column.visualSizeFactor}>
                                    <Text align="end">{}</Text> 
                                </TableCell>
                            )
                        })}
                    </TableRow>

                    {expanded && childRows.map((childRow) => {      
                        const onSelect = () => {
                            dataset.setSelectedRecordIds([childRow.getRecordId()]);
                        };            
                        const openRecord = () => {
                            dataset.setSelectedRecordIds([childRow.getRecordId()]);
                            setSelectedRow({
                                recordId: childRow.getRecordId(),
                                recordDate: childRow.getFormattedValue("diana_date"),
                                recordValue: childRow.getFormattedValue("diana_value"),
                                parentId: childRow.getValue("diana_projectid") as any                                
                            });
                        }      
                        return (<TableRow key={childRow.getRecordId()} onClick={onSelect} onDoubleClick={openRecord}>                             
                        <TableCell >
                            <TableCellLayout media={<ReOrderDotsVertical24Regular />} />
                        </TableCell>                                               
                        {columns.map((column)=> {       
                            const text = childRow.getFormattedValue(column.name);
                            return <TableCell key={column.name} width={column.visualSizeFactor}>{text} </TableCell>
                        })}
                        
                        </TableRow>);
                    })
                    }
                    </>
                )
            })
            }                    
               
            </TableBody>
        </Table>

        </FluentProvider>
        </div>
    );
}

export const GroupedGrid = React.memo(GroupedGridRaw);