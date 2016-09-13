import * as React from 'react';

interface ISelectControlProps {
    onChange: (value: string) => void;
    options: Array<{ value: string, name: string }>;
}

export class SelectControl extends React.Component<ISelectControlProps, void> {

    constructor(props: ISelectControlProps) {
        super(props);
    }

    componentDidMount() {
    }

    change(event) {
        this.props.onChange(event.target.value);
    }

    public render() {
        return <div>
            <select onChange={(e) => this.change(e) }>
                { this.props.options.map((option) => <option value={option.value}>{option.name}</option>) }
            </select>
        </div>;
    }
}
