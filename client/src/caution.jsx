import React, {Component} from 'react'
import { Button, Result} from 'antd';

import './App.css'




class Caution extends Component {

    constructor(props){
        super(props);
        this.state = {

        }

        // this.next = this.next.bind(this)



    }

    begin_now=()=>{

        this.handle_render_test()
    }


    componentDidMount(){

        this.handle_render_test = this.props.handle_render_test

    }


    render(){

        let status = this.props.status || ''

        return(

            <div id="caution_container">

                    <Result
                        title="The test will begin"
                        subTitle="Congrats you made all mini-test correctly! The test is about to begin and the time counter will also start once you click the button. The test will last about 20 minutes before the final questionnaire. "
                        extra={
                            <Button type="primary" key="console" onClick={this.begin_now}>
                                Start Now!
                            </Button>
                        }
                    />
                <span style={{'fontWeight': 'bold', 'fontSize': '15px'}}>Tips: Both the time cost and the accuracy of your responses will be recorded. So please try to finish the tasks as accurately as possible, and as quickly as possible.</span>

            </div>
        )
    }
}

export default Caution;