import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { addDays, formateDate } from "./Components/data";
import { GroupedGrid, IGroupedGridProps } from "./Components/GrouppedGrid";
import { TSelectedRow, selectedRowSchema } from "./Components/outputSchema";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class FluentUI9GrouppedGrid implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private notifyOutputChanged: () => void;
    private selectedRow: TSelectedRow | null = null;
    private onRowEdit: () => void = () => {};

    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    private setSelectedRow(selectedRow: TSelectedRow |null){
        this.selectedRow = selectedRow;       
        this.notifyOutputChanged();
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const from  = context.parameters.from?.raw ?? addDays(new Date(), -7);
        const to = context.parameters.to?.raw ?? new Date();
        this.onRowEdit = (context as any).events.OnRowEdit;
        const props: IGroupedGridProps  = { 
            dataset: context.parameters.dataset, 
            theme: (context as any).fluentDesignLanguage?.tokenTheme,
            from: formateDate(from, context),
            to: formateDate(to, context),          
            setSelectedRow: this.setSelectedRow.bind(this),
            onRowEdit : this.onRowEdit,           
            refresh: context.parameters.refresh?.raw,
            context

        };
        return React.createElement(
            GroupedGrid, props
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {
            selectedRow : this.selectedRow
         };
    }

         /**
     * It is called by the framework prior to a control init to get the output object(s) schema
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns an object schema based on nomenclature defined in manifest
     */
         public async getOutputSchema(context: ComponentFramework.Context<IInputs>): Promise<any> {
            return Promise.resolve({
                selectedRow: selectedRowSchema
            });
        }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
