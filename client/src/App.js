import React, {Component} from 'react'
import ReactDOM from 'react-dom/client';

import './App.css'

import Intro from "./intro";
import Test from "./test";





class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            test: false,
            results: false,

            user_id: ''


        }

        this.handle_render_test = this.handle_render_test.bind(this)
        this.handle_render_results = this.handle_render_results.bind(this)

    }


    handle_render_test(){
        this.setState({
            test: true
        })
    }

    handle_render_results(){

        this.setState({
            results: true
        })
    }

    componentDidUpdate(prevProps, prevStates) {


        if(prevStates['test'] != this.state.test){
            new Promise((resolve, reject)=>{

                /*渲染 Test 组件*/
                this.block.render(<Test user_id={this.state.user_id}/>)

                resolve()
            })
                .then(()=>{
                    this.intro.unmount(<Intro />)

                })
        }


            /*unmount Intro 组件*/

        //
        // if(this.state.results==true){
        //
        //     new Promise((resolve, reject)=>{
        //
        //         /* unmount Test 组件*/
        //         this.block.unmount(<Test/>)
        //
        //         resolve()
        //     }).then(()=>{
        //             /*渲染 Results 组件*/
        //             this.results.render(<Results status='pass'/>)
        //
        //         })
        //
        //
        //
        //
        //
        // }
    }

    set_user_id=(user_id)=>{
        this.setState({
            user_id: user_id || `random_${Math.random()*1000}`
        })

    }


    componentDidMount() {

        this.block = ReactDOM.createRoot(document.getElementById('test_container'))
        this.intro = ReactDOM.createRoot(document.getElementById('intro_container'))


        /*渲染 Intro 组件*/
        this.intro.render(<Intro handle_render_test={this.handle_render_test} set_user_id={this.set_user_id}/>)


    }


    render(){

        return(
            <div className='container'>

                <div id="intro_container"></div>


                <div id="test_container"></div>


                {/*<Results status='pass'/>*/}

            </div>
        )
    }
}

export default App;