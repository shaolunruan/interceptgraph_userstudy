import React, {Component} from 'react';
import axios from 'axios';


import slopechart_build from "../function/slopechart";

class SlopegraphPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            item : 'react component'
        }
    }

    componentDidMount(){

        let data_name = this.props.data_name

        // axios.get(`/api/`)
        slopechart_build('#slopeGraph_SVGContainer', data_name)

    }

    render(){

        return(
            <>
                <div className="interface">
                    <svg className={'component'} id="slopeGraph_SVGContainer" width='700px' height='700px'/>
                </div>
            </>
        )
    }
}

export default SlopegraphPage;