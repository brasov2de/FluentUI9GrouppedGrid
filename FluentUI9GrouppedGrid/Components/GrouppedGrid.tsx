import * as React from "react";
import {ChevronDown24Filled, ChevronRight24Filled ,ReOrderDotsVertical24Regular, EditFilled, EditRegular, bundleIcon} from "@fluentui/react-icons";
import { Input, SpinButton, Table, TableBody, TableCell, TableHeader, TableRow, Theme, Text, makeStyles, TableHeaderCell, TableCellLayout, 
useFocusableGroup, useArrowNavigationGroup, FluentProvider, TableCellActions, Button} from "@fluentui/react-components";
import { TData, TGroup, TGroupsExpanded, filterDataset, parseDataset } from "./data";
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

const GroupedGridRaw = ({dataset, theme, from, to, context,  refresh} : IGroupedGridProps) => {
    const styles=useStyles();
    const keyboardNavAttr = useArrowNavigationGroup({ axis: "grid" });
   /* const focusableGroupAttr = useFocusableGroup({
        tabBehavior: "limited-trap-focus",
    });*/


    const [data, setData] = React.useState<TData>({sortedGroups: [], groups: {}});
    const [expandedGroups, setExpandedGroups] = React.useState<TGroupsExpanded>({});

    React.useEffect(() => {
        if(dataset.loading || dataset.filtering.getFilter()==null ) return;
        const dataTmp =  parseDataset(dataset, context);
        setData(dataTmp);
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
                    <TableHeaderCell style={{width: "50px"}}>&nbsp;                        
                    </TableHeaderCell>                    

                    <TableHeaderCell className={styles.container}>
                        <Text align="start">Project</Text>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        Sum
                    </TableHeaderCell>
                    {dataset.columns.map((column)=> {
                        return (<TableHeaderCell style={{width:"50px"}} key={column.name}>
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
                        <TableCell>
                            <TableCellLayout media={expanded ? <ChevronDown24Filled /> : <ChevronRight24Filled/>} onClick={onExpand}/>
                        </TableCell>                               
                        <TableCell className={styles.container} >
                            <TableCellLayout appearance="primary" description={group.name} >
                                <Text weight="bold" align="start">{}</Text> 
                            </TableCellLayout>
                        </TableCell>
                        <TableCell>
                            sum
                        </TableCell>
                        {dataset.columns.map((column: ComponentFramework.PropertyHelper.DataSetApi.Column)=> {
                            return (
                                <TableCell key={column.name}>
                                    <Text align="end">{}</Text> 
                                </TableCell>
                            )
                        })}
                    </TableRow>

                    {expanded && childRows.map((childRow) => {                        
                        return (<TableRow key={childRow.key} >                             
                        <TableCell >
                            <TableCellLayout media={<ReOrderDotsVertical24Regular />} />
                        </TableCell>                        

                        <TableCell  className={styles.container}>                            
                            <Input type="text" defaultValue={childRow.comment ?? ""} contentEditable={true} appearance="outline" id="comment"/>                            
                        </TableCell>
                        <TableCell >
                            {childRow.sumReported ?? 0}
                        </TableCell>
                        {dataset.columns.map((column)=> {       
                            const text = childRow.getFormattedValue(column.name);
                            return <TableCell key={column.name}>{text} </TableCell>
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