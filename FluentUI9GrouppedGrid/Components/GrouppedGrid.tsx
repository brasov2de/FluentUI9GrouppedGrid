import * as React from "react";
import {ChevronDown24Filled, ChevronRight24Filled ,ReOrderDotsVertical24Regular, EditFilled, EditRegular, bundleIcon} from "@fluentui/react-icons";
import { Input, SpinButton, Table, TableBody, TableCell, TableHeader, TableRow, Theme, Text, makeStyles, TableHeaderCell, TableCellLayout, 
useFocusableGroup, useArrowNavigationGroup, FluentProvider, TableCellActions, Button,
TableSelectionCell, useTableFeatures,
useTableSelection,
TableColumnDefinition,
TableRowId} from "@fluentui/react-components";
import { TData, TGroup, TGroupsExpanded, filterDataset, formateDate, getSortedColumnsOnView, parseDataset } from "./data";
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
    onRowEdit: () => void;
    refresh ?: string | null;
    context: ComponentFramework.Context<IInputs>
}

const GroupedGridRaw = ({dataset, theme, from, to, context,  refresh, setSelectedRow, onRowEdit} : IGroupedGridProps) => {
    const styles=useStyles();
    const keyboardNavAttr = useArrowNavigationGroup({ axis: "grid" });
   /* const focusableGroupAttr = useFocusableGroup({
        tabBehavior: "limited-trap-focus",
    });*/


    const [data, setData] = React.useState<TData>({sortedGroups: [], groups: {}});
    const [columns, setColumns] = React.useState<TableColumnDefinition<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>[]>(getSortedColumnsOnView(dataset.columns, ["parentId","diana_projectid"]))
    const [expandedGroups, setExpandedGroups] = React.useState<TGroupsExpanded>({});
    const [sum, setSum] = React.useState<number>(0);

    React.useEffect(() => {
        if(dataset.loading ) return;
        const dataTmp =  parseDataset(dataset, context);
        setData(dataTmp);
        setColumns(getSortedColumnsOnView(dataset.columns, ["parentId", "diana_projectid"]));
        setExpandedGroups(dataTmp.sortedGroups.reduce((acc, key) => {acc[key] = true; return acc;}, {} as TGroupsExpanded)); 
        const newSum = dataset.sortedRecordIds.reduce((acc, id) => {
            const row =  dataset.records[id];
           // const isCurrentDate = formateDate(row.getValue("diana_date") as Date, context) == currentDate;
            return acc + (row.getValue("diana_value") as number ?? 0);
        }, 0);
        if(newSum != sum){
            setSum(newSum);            
            const row = dataset.records[dataset.getSelectedRecordIds()[0]];            
            setSelectedRow({
                recordId: row?.getRecordId(),
                recordDate: row?.getValue("diana_date") as string ?? "" ,
                recordValue: row?.getValue("diana_value") as number ?? 0,
                parentId: row?.getValue("diana_projectid") as any , 
                dateSum : newSum
            });           
        }
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

    const [selectedRows, setSelectedRows] = React.useState(() => new Set<TableRowId>([0,1]));

    const {
        getRows,
        selection: {
            allRowsSelected, 
            someRowsSelected, 
            toggleRow, 
            toggleAllRows,
            isRowSelected
        }
    } = useTableFeatures({
        columns: columns,
        items: dataset.sortedRecordIds.map((id) => dataset.records[id]),
    }, [ useTableSelection({
        selectionMode: "single",
        selectedItems : selectedRows, 
        onSelectionChange: (e, data1) => {
            setSelectedRows(data1.selectedItems)
        }
        })
    ]);
      

    return (
        <div style={{ width: "100%" , overflow: "scroll"}}>
        <FluentProvider theme={theme}>
        <Table aria-role="grid" role="grid" {...keyboardNavAttr} aria-label="Table with single selection">            
            <TableHeader>
                <TableRow>                    
                    <TableHeaderCell style={{width: "50px"}} key="action" >&nbsp;                        
                    </TableHeaderCell>                    

                    <TableHeaderCell className={styles.container} key="groupby" >
                        <Text align="start">Project / Name </Text>
                    </TableHeaderCell>                  
                    {columns.map((column, index)=> {
                        if(index==0) return null;
                        return (<TableHeaderCell key={column.columnId} >
                            <Text align="end">{column.columnId}</Text>
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
                        {columns.map((column: TableColumnDefinition<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>, index: number)=> {
                            if(index==0) return null;
                            return (
                                <TableCell key={column.columnId} >
                                    <Text align="end">{}</Text> 
                                </TableCell>
                            )
                        })}
                    </TableRow>

                    {expanded && childRows.map((childRow) => {     
                        const selected = isRowSelected(childRow.getRecordId()); 
                        const onClick = (e : React.MouseEvent) => {
                            toggleRow(e, childRow.getRecordId());
                            dataset.setSelectedRecordIds([childRow.getRecordId()]);    
                            setSelectedRow({
                                recordId: childRow.getRecordId(),
                                recordDate: childRow.getFormattedValue("diana_date"),
                                recordValue: childRow.getFormattedValue("diana_value"),
                                parentId: childRow.getValue("diana_projectid") as any , 
                                dateSum : sum
                            });
                                             
                        };            
                        const openRecord = () => {
                            dataset.setSelectedRecordIds([childRow.getRecordId()]);
                            //   const currentDate = formateDate(childRow.getValue("diana_date"), context);                              
                            onRowEdit();
                        }   
                        const onKeyDown= (e: React.KeyboardEvent) => {
                            if (e.key === " ") {
                              e.preventDefault();
                              toggleRow(e, childRow.getRecordId());
                            }
                          }   
                        return (<TableRow key={childRow.getRecordId()} onClick={onClick} onDoubleClick={openRecord} appearance={selected ? "brand" : "none"} aria-selected={selected} onKeyDown={onKeyDown}> 
                         
                        <TableCell >
                            <TableCellLayout media={<ReOrderDotsVertical24Regular />} />
                        </TableCell>                                               
                        {columns.map((column)=> {       
                            const text = childRow.getFormattedValue(column.columnId);
                            return <TableCell key={column.columnId}>{text} </TableCell>
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