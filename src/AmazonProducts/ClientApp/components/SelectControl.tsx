import * as React from 'react';

interface ISelectControlProps {
    onChange: (value: string) => void;
    options: Array<{ value: string, name: string }>;
}

export class SelectControl extends React.Component<ISelectControlProps, void> {

    private _select: any;

    constructor(props: ISelectControlProps) {
        super(props);
    }

    public change(event) {
        this.props.onChange(event.target.value);
    }

    public getValue(): string {
        return this._select.value;
    }

    public setValue(value: string) {
        this._select.value = value;
    }

    public render() {
        return <div>
            <select onChange={(e) => this.change(e) } ref={(c) => this._select = c} style={{ padding: "3px" }}>
                { this.props.options.map((option) => <option value={option.value}>{option.name}</option>) }
            </select>
        </div>;
    }
}
