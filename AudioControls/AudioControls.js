import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Slider,
    Text,
    Dimensions
} from 'react-native';
import moment from 'moment';
import 'moment/locale/pt-br';

import images from '../config/images';
import colors from '../config/colors';
import AudioController from '../AudioController';

const { width, height } = Dimensions.get('window');

class AudioControls extends Component {
    static defaultProps = {
        ...Component.defaultProps,

        //SKIP SECONDS
        hasButtonSkipSeconds: false,
        timeToSkip: 15,

        //THUMBNAIL
        thumbnailSize: {
            width: width * 0.6,
            height: width * 0.6
        },

        //SOUND
        titleStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.white
        },
        authorStyle: {
            fontSize: 16,
            color: colors.white
        },

        //COLORS
        activeColor: colors.white,
        inactiveColor: colors.grey,

        //BUTTONS
        activeButtonColor: null,
        inactiveButtonColor: null,

        //SLIDER
        sliderMinimumTrackTintColor: null,
        sliderMaximumTrackTintColor: null,
        sliderThumbTintColor: null,
        sliderTimeStyle: {
            fontSize: 18,
            color: colors.white
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            duration: 0,
            currentTime: 0,
            currentAudio: {},
            isReady: true,
            isPlaying: false
        };
    }

    componentWillMount() {
        const { playlist, initialTrack, currentStatus } = this.props;
        // if ( currentStatus !== 'PLAYING' ) {
            AudioController.init(playlist, initialTrack, this.onChangeStatus, this.updateCurrentTime);
        // }
    }

    onChangeStatus = (status) => {
        switch (status) {
            case AudioController.status.PLAYING:
                this.setState({ isPlaying: true });
                break;
            case AudioController.status.PAUSED:
                this.setState({ isPlaying: false });
                break;
            case AudioController.status.STOPPED:
                this.setState({ isPlaying: false });
                break;
            case AudioController.status.LOADED:
                AudioController.getDuration((seconds) => {
                    this.setState({ duration: seconds });
                });
                this.setState({ currentAudio: AudioController.currentAudio });
                break;
            case AudioController.status.ERROR:
                console.log('Status Error');
                break;
            default:
                return;
        }
    }

    updateCurrentTime = (seconds) => {
        this.setState({ currentTime: seconds });
    }

    renderPlayerIcon() {
        const { isPlaying } = this.state;
        if (isPlaying) {
            return (
                <TouchableOpacity
                    onPress={() => AudioController.pause()}
                >
                    <Image
                        source={images.iconPause}
                        style={[
                            styles.playButton,
                            { tintColor: this.props.activeButtonColor || this.props.activeColor }
                        ]}
                    />
                </TouchableOpacity >
            );
        }

        return (
            <TouchableOpacity
                onPress={() => AudioController.play()}
            >
                <Image
                    source={images.iconPlay}
                    style={[
                        styles.playButton,
                        { tintColor: this.props.activeButtonColor || this.props.activeColor }
                    ]}
                />
            </TouchableOpacity >
        );
    }

    renderNextIcon() {
        if (AudioController.hasNext()) {
            return (
                <TouchableOpacity onPress={() => AudioController.playNext()}>
                    <Image
                        source={images.iconNext}
                        style={[
                            styles.controlButton,
                            { tintColor: this.props.activeButtonColor || this.props.activeColor }
                        ]}
                    />
                </TouchableOpacity>
            );
        }
        return (
            <Image
                source={images.iconNext}
                style={[
                    styles.controlButton,
                    { tintColor: this.props.inactiveButtonColor || this.props.inactiveColor }
                ]}
            />
        );
    }

    renderPreviousIcon() {
        if (AudioController.hasPrevious()) {
            return (
                <TouchableOpacity onPress={() => AudioController.playPrevious()}>
                    <Image
                        source={images.iconPrevious}
                        style={
                            [styles.controlButton,
                            { tintColor: this.props.activeButtonColor || this.props.activeColor }
                            ]}
                    />
                </TouchableOpacity>
            );
        }
        return (
            <Image
                source={images.iconPrevious}
                style={[
                    styles.controlButton,
                    { tintColor: this.props.inactiveButtonColor || this.props.inactiveColor }
                ]}
            />
        );
    }

    renderSkipbackwardIcon() {
        if (!this.props.hasButtonSkipSeconds) return;
        return (
            <TouchableOpacity
                onPress={() => {
                    AudioController.seekToForward(-this.props.timeToSkip);
                }}
            >
                <Image
                    source={images.skipBackward}
                    style={[
                        styles.controlButton,
                        { tintColor: this.props.activeButtonColor || this.props.activeColor }
                    ]}
                />
            </TouchableOpacity>
        );
    }

    converToPersian(str) {
        let number = str.toString();
        number = String(number).replace(/\d/g, digit => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][digit]);
        return number;
    }

    renderSkipforwardIcon() {
        if (!this.props.hasButtonSkipSeconds) return;
        return (
            <TouchableOpacity
                onPress={() => {
                    AudioController.seekToForward(this.props.timeToSkip);
                }}
            >
                <Image
                    source={images.skipForward}
                    style={[styles.controlButton, { tintColor: this.props.activeButtonColor || this.props.activeColor }]}
                />
            </TouchableOpacity>
        );
    }

    render() {
        const { currentTime, duration, currentAudio } = this.state;
        return (
            <View style={[styles.container]}>
                <View style={{ flex: 2.4 }}>
                    <Image
                        source={currentAudio.thumbnailUri ? { uri: currentAudio.thumbnailUri } : currentAudio.thumbnailLocal}
                        style={styles.thumbnailSize}
                        blurRadius={2}
                        // style={this.props.thumbnailSize}
                    />
                    <View style={styles.detailContainer}>
                        <Text style={this.props.nameStyle}>{currentAudio.name}</Text>
                        <Text style={this.props.titleStyle}>{currentAudio.title}</Text>
                        <Text style={this.props.authorStyle}>{currentAudio.author}</Text>
                        <Text style={this.props.authorStyle}>({this.converToPersian(this.props.initialTrack + 1)}/{this.converToPersian(this.props.playlist.length)})</Text>
                    </View>
                </View>
                
                <View style={[styles.bot, { flex: 1 }]}>
                    <View style={{ flexDirection: 'row', width: width, position: 'absolute', top: -30 }}>
                        <View style={[styles.timeStyle, { alignItems: 'flex-start' }]}>
                            <Text numberOfLines={1} style={this.props.sliderTimeStyle}>
                                {this.converToPersian(currentTime ? moment.utc(currentTime * 1000).format('mm:ss') : '00:00')}
                            </Text>
                        </View>
                        <View style={[styles.timeStyle, { alignItems: 'flex-end' }]}>
                            <Text numberOfLines={1} style={this.props.sliderTimeStyle}>
                                {this.converToPersian(duration ? moment.utc(duration * 1000).format('mm:ss') : '00:00')}
                            </Text>
                        </View>
                        
                    </View>
                    <View style={styles.playbackContainer}>
                        
                        <Slider
                            value={currentTime}
                            maximumValue={duration}

                            style={styles.playbackBar}

                            minimumTrackTintColor={"#2ecc71"}
                            maximumTrackTintColor={"#fff"}
                            thumbTintColor={"#2ecc71"}
                            
                            // minimumTrackTintColor={this.props.sliderMinimumTrackTintColor ||
                            //     this.props.activeColor}
                            // maximumTrackTintColor={this.props.sliderMaximumTrackTintColor ||
                            //     this.props.inactiveColor}
                            // thumbTintColor={this.props.sliderThumbTintColor || this.props.activeColor}

                            onSlidingComplete={seconds => {
                                AudioController.seek(seconds);
                                if (seconds < duration) AudioController.play();
                            }}

                            onValueChange={() => AudioController.clearCurrentTimeListener()}
                        />
                        
                    </View>
                    
                    <View style={styles.buttonsContainer}>
                        <View style={styles.subBtn}>
                            {this.renderSkipbackwardIcon()}
                        </View>
                        <View style={styles.subBtn}>
                            {this.renderPreviousIcon()}
                        </View>
                        <View style={styles.subBtn}>
                            {this.renderPlayerIcon()}
                        </View>
                        <View style={styles.subBtn}>
                            {this.renderNextIcon()}
                        </View>
                        <View style={styles.subBtn}>
                            {this.renderSkipforwardIcon()}
                        </View>
                    </View>

                    <View style={{ position: 'absolute', bottom: 20 }}>
                        <Image
                            source={images.logoText}
                            style={{ width: width / 4, height: 30, resizeMode: 'contain' }}
                        />
                    </View>
                </View>
                
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    thumbnailSize: {
        width: width,
        height: '100%',
        resizeMode: 'cover'
    },
    detailContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'right',
        paddingHorizontal: 20,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: width,
        height: '100%',
    },
    bot: {
        backgroundColor: '#04243d',
        width: width,
        flexDirection: 'column',
        // justifyContent: 'center',
        alignItems: 'center'
    },
    timeStyle: {
        flex: 1,
        paddingHorizontal: 10
    },
    playbackContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: -8,
        
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30
    },
    subBtn: {
        marginHorizontal: 10
    },
    playbackBar: {
        width: '100%',
        transform: [{ scaleX: 1.08 }, { scaleY: 1.1 }]
    },
    playButton: {
        width: 80,
        height: 80,
    },
    controlButton: {
        width: 20,
        height: 20,
        margin: 5
    }
});

export default AudioControls;
