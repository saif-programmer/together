import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import NavBarHome from './NavBarHome';
import Canvas from './Canvas';
import FooterHome from './FooterHome';
import '../stylesheets/Room.css';

const Room = (props) => {
	
	// Initialize and open a websocket connection to the server
	const ws = useRef(null);
	useEffect(() => {
		ws.current = new WebSocket('ws://127.0.0.1:8000/ws/room/');
		ws.current.onopen = () => {
			console.log('websocket conneciton opened');
			ws.current.send(JSON.stringify({'command': 'fetch_messages' }));
		};
		ws.current.onclose = () => console.log('websocket conneciton closed');

		// Close the websocket connection when the component unmounts
		return () => {
			ws.current.close();
		};
	}, []);

	// Handle receiving websocket messages from the server
	const [allLists, setAllLists] = useState([]);
	const [mouseCoords, setMouseCoords] = useState(null);
	useEffect(() => {
		if (!ws.current) return;

		ws.current.onmessage = e => {
			const data = JSON.parse(e.data);
			console.log('onmessage data:', data);

			if (data.command === 'new_message'){
				setAllLists([...allLists, data.message.content]);
				console.log('new_message recieved', data.message.content);

			} else if(data.command === 'messages') {
				const recievedList = data.messages.map(messageObj => messageObj.content);
				setAllLists(recievedList);
				console.log('messages recieved', recievedList);

			} else if(data.command === 'new_canvas_coords') {
				setMouseCoords({offsetX: data.offset_x, offsetY: data.offset_y});
				console.log('new_canvas_coords recieved', mouseCoords);
			}
		};
	}, [allLists, mouseCoords]);

	// Get updated value of window width when resizing or on different screen sizes
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	useEffect(() => {
		function handleResize() {
			setWindowWidth(window.innerWidth);
		}
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Get a random daily tip from the server
	const [dailyTip, setDailyTip] = useState({});
	useEffect(() => {
		axios.get('http://127.0.0.1:8000/api/2')
			.then(res => {
				setDailyTip(res.data);
			})
			.catch(err => {
				console.log(`Error getting daily tip: ${err.response}`);
			});
	}, []);

	// Set the Canvas properties and pass the values to the Canvas component
	const [strokeColor, setStrokeColor] = useState('black');
	const [strokeMode, setStrokeMode] = useState('draw');
	const changeModeToDraw = () => {
		setStrokeMode('draw');
	};
	const changeStrokeColor = (color) => {
		setStrokeColor(color);
		setStrokeMode('draw');
	};

	// Form submit function for the lists
	const [textInput, setTextInput] = useState('');
	const handleSubmit = (event) => {
		event.preventDefault();
		ws.current.send(JSON.stringify({
			'command': 'new_message',
			'message': textInput,
			'from': 'Pete'
		}));
		console.log('allLists', allLists);
		setTextInput('');
	};

	// Recieve mouse coords from the Canvas component when drawing (send data to server for braodcasting)
	const updateMousePos = (mouseEvent) => {
		if(ws.current.readyState === WebSocket.OPEN) {
			console.log('MouseEvent from Canvas', mouseEvent);
			ws.current.send(JSON.stringify({
				'command': 'new_canvas_coords',
				'offset_x': mouseEvent.offsetX,
				'offset_y': mouseEvent.offsetY
			}));
		}
	};

	// Conditional renders for more responsive elements
	let statCardContainerClasses = 'col-lg-3';
	if (windowWidth <= 992) {
		statCardContainerClasses += ' p-5';
	} else {
		statCardContainerClasses += ' pl-0 pr-5 pb-5 pt-5';
	}

	return (
		<div id="room-page">
			<NavBarHome {...props} />

			<div className="upper-container row mt-4" style={{margin: '0'}}>
				<div className="col-lg-9 canvas-card-wrapper p-5">
					<div className="card shadow mb-4">
						<div className="card-header py-2 d-flex flex-row align-items-center justify-content-between">
							<h6 className="m-0 font-weight-bold text-center" style={{display: 'block'}}>Canvas</h6>

							<div className="right-side-wrapper">
								<div className="canvas-btn btn mr-3" onClick={() => setStrokeMode('clear')} role='button'>
									<div className="justify-content-center h-100 d-flex align-items-center">
										Clear
									</div>
								</div>
								<div className="dropdown no-arrow" style={{display: 'inline-block'}}>
									<div className="dropdown-toggle" style={{color: 'black'}} role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									</div>
									<div className="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
										<div className="dropdown-header">Switch colors:</div>
										<button className="dropdown-item" style={{color: 'black'}} onClick={() => changeStrokeColor('black')}>Black</button>
										<button className="dropdown-item" style={{color: 'blue'}} onClick={() => changeStrokeColor('blue')}>Blue</button>
										<button className="dropdown-item" style={{color: 'red'}} onClick={() => changeStrokeColor('red')}>Red</button>
										<button className="dropdown-item" style={{color: 'green'}} onClick={() => changeStrokeColor('green')}>Green</button>
									
										<hr className='dropdown-divider' />

										<button className="dropdown-item" onClick={() => setStrokeMode('draw')}>Draw</button>
										<button className="dropdown-item font-weight-bold" onClick={() => setStrokeMode('erase')}>Eraser</button>
									</div>
								</div>
							</div>
							
						</div>
                
						<div className="card-body p-0" id="canvas-container" style={{overflow: 'hidden'}}>
							<Canvas 
								width={1000} height={330} 
								color={strokeColor} 
								mode={strokeMode} 
								mouseCoords={mouseCoords}
								handleClear={changeModeToDraw} 
								updateMousePos={updateMousePos} 
							/>
						</div>
					</div>
				</div>

				<div className={statCardContainerClasses}>
					<div className="mb-4">
						<div id="top-data-card" className="data-card card border-left-primary  h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-red mb-1">Days Together</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">736</div>
									</div>
									<div id="top-data-card-icon" className="data-card-icon col-auto">
										<FontAwesomeIcon icon={['fas', 'heart']} />
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mb-4">
						<div id="middle-data-card" className="data-card card border-left-primary h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-blue mb-1">Other Stats</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">23</div>
									</div>
									<div id="middle-data-card-icon" className="data-card-icon col-auto">
										<FontAwesomeIcon icon={['fas', 'address-card']} />
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mb-4">
						<div id="bottom-data-card" className="data-card card border-left-primary  h-100 py-2">
							<div className="card-body">
								<div className="row no-gutters align-items-center">
									<div className="col mr-2">
										<div className="text-xs font-weight-bold text-green mb-1">More Cool Data</div>
										<div className="h5 mb-0 font-weight-bold text-gray-800">3279</div>
									</div>
									<div id="bottom-data-card-icon" className="data-card-icon col-auto">
										<FontAwesomeIcon icon={['fas', 'comment']} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div className="lower-container row" style={{margin: '0'}}>
				<div className="col-lg-6 pr-5 pl-5">
					<div className="card shadow mb-4" style={{minHeight: '500px'}}>
						<div className="card-header py-2" style={{backgroundColor: '#4e73df'}}>
							<h6 className="m-0 font-weight-bold" style={{color: 'white'}}>Your Lists</h6>
						</div>
                
						<div className="card-body" style={{backgroundColor: '#ecf4ff'}}>
							<div className="list-item p-3 mb-3 d-flex align-items-center" >Shopping</div>
							<div className="list-item p-3 mb-3 d-flex align-items-center" >ToDo</div>
							<div className="list-item p-3 mb-3 d-flex align-items-center" >Important Reminders!</div>
							<div className="list-item p-3 mb-3 d-flex align-items-center">Date Spot Ideas <span role="img" aria-label="heart emoji">❤️</span></div>
						</div>
					</div>
				</div>

				<div className="col-lg-6 pr-5 pl-5 mb-5">
					<div className="card shadow mb-4" style={{minHeight: '500px'}}>
						<div className="card-header py-2" style={{backgroundColor: '#ff0048'}}>
							<h6 className="m-0 font-weight-bold" style={{color: 'white'}}>Happy Time</h6>
						</div>
                
						<div className="card-body" style={{backgroundColor: '#ffe6ed'}}>
							
							<div className="play-btn card shadow-sm mb-3" role='button'>
								<div className="card-body">
									<div className="play-text-container justify-content-center h-100 d-flex align-items-center h3">
										<span className="mr-2">Play quiz!</span>
										<span>
											<FontAwesomeIcon icon={['fas', 'play-circle']} />
										</span>
									</div>
								</div>
							</div>

							<div className="card shadow-sm" style={{height: '250px'}}>
								<div className="card-header p-3 h6 font-weight-bold">Tip of the day</div>
								<div className="card-body" style={{overflow: 'auto'}}>
									<h6 className="card-title text-center font-weight-bold">{dailyTip.title}</h6>
									<div className="card-text">{dailyTip.content}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<FooterHome />
		</div>
	);
};

export default Room;