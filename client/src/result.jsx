import React, {Component} from 'react'
import { Button, Result} from 'antd';

import './App.css'




class Results extends Component {

    constructor(props){
        super(props);
        this.state = {

        }

        // this.next = this.next.bind(this)



    }


    componentDidMount(){


    }


    render(){

        let status = this.props.status || ''


        return(

            <div id="result_container">

                {status==='pass'?
                    <Result
                        status="success"
                        title="Successfully complete tests! Your completion code is 626EF405"
                        subTitle="Thanks for your participation!"

                    />:
                    <Result
                        status="error"
                        title="Test Failed"
                        subTitle="You made a wrong answer to the mini-test question. Please re-load the page and treat every test CAREFULLY!"
                    />}
            </div>
        )
    }
}

export default Results;