import React, {Component} from 'react';
import ReactDOM from 'react-dom/client';

import axios from 'axios';



import interceptgraph_build from "../function/interceptgraph";

class InterceptgraphPage extends Component {
    constructor(props){
        super(props);
        this.state = {

        }

    }




    componentDidMount(){

        let data_name = this.props.data_name


        interceptgraph_build('#interceptGraph_SVGContainer', data_name)

    }

    render(){

        return(
            <>
                <div>
                    <svg className={'component'} id="interceptGraph_SVGContainer" width='700px' height='700px'/>
                </div>
            </>
        )
    }
}

export default InterceptgraphPage;