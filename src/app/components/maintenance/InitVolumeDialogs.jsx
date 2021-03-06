import React from 'react'
import Debug from 'debug'
import { Checkbox, CircularProgress, Dialog, TextField } from 'material-ui'
import ToggleRadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked'
import ToggleRadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'
import request from 'superagent'
import FlatButton from '../common/FlatButton'
import { VerticalExpandable } from './ConstElement'
import { UpIcon, DownIcon } from './Svg'

const debug = Debug('component:maintenance:InitVolumeDialogs')

class UsernamePassword extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  onChange(name, value) {
    this.setState((state) => {
      const nextState = Object.assign({}, state)
      nextState[name] = value

      const { username, password, passwordAgain } = nextState

      if (typeof username === 'string' && username.length > 0 &&
          typeof password === 'string' && password.length > 0 &&
          password === passwordAgain) { this.props.onChange({ username, password }) } else { this.props.onChange(null) }

      return nextState
    })
  }

  render() {
    return (
      <div>
        <div><TextField
          hintText="" floatingLabelText="用户名" maxLength={20}
          onChange={e => this.onChange('username', e.target.value)}
        /></div>
        <div><TextField
          hintText="" floatingLabelText="输入密码" type="password" maxLength={40}
          onChange={e => this.onChange('password', e.target.value)}
        /></div>
        <div><TextField
          hintText="" floatingLabelText="再次输入密码" type="password" maxLength={40}
          onChange={e => this.onChange('passwordAgain', e.target.value)}
        /></div>
      </div>
    )
  }
}

const ReinitVolumeConfirm = (props) => {
  const volume = props.volume
  const wisnuc = volume.wisnuc
  const expandableHeight = props.expanded ? 120 : 0

  let warning = ''
  if (wisnuc.status === ('READY' || 'DAMAGED')) {
    warning = '文件系统已经包含wisnuc应用的用户数据，请仔细阅读下述信息，避免数据丢失！'
  } else if (wisnuc.status === 'AMBIGUOUS') {
    warning = '文件系统可能包含wisnuc应用的用户数据，请仔细阅读下述信息，避免数据丢失！'
  } else if (wisnuc.error === 'EWISNUCNOTDIR') {
    warning = '警告：文件系统存在文件 wisnuc 与wisnuc应用数据的目录结构冲突！'
  } else if (wisnuc.error === 'EFRUITMIXNOTDIR') {
    warning = '警告：文件系统存在文件 wisnuc/fruitmix 与wisnuc应用数据的目录结构冲突！'
  } else if (wisnuc.error === 'EWISNUCNOFRUITMIX' && volume.mountpoint !== '/') { // for rootfs this is normal case
    warning = '警告：文件系统存在wisnuc文件夹，但不包含wisnuc应用的用户数据！'
  } else {
    warning = '警告：文件系统存在wisnuc文件夹且挂载点并不是根目录,但不包含wisnuc应用的用户数据！'
  }
  const general = 'wisnuc应用在文件系统根目录上建立名为wisnuc的文件夹存放数据；其中fruitmix子文件夹存放用户的私有云应用数据，包括用户通过手机、客户端以及Windows文件共享(Samba)等方式传输的文件和照片；wisnuc目录下的其他文件夹可能用于存放appifi/docker第三方应用的镜像文件、私有数据（例如Transmission的下载文件，ownCloud的私有云文件）；对于ws215i用户，如果系统从2016年1月的版本升级至最新版本，且没有做过数据迁移，则老版本系统的用户数据也存放在wisnuc目录下的其他目录内。'

  const removeWisnuc = '选择该选项会删除所有上述存放于wisnuc目录下的数据。'
  const removeFruitmix = '选择该选项会保留原wisnuc目录下的其他目录数据，包括appifi/docker应用镜像，appifi/docker第三方应用数据，老版本软件尚未迁移的用户数据；但删除所有位于fruitmix目录下的wisnuc私有云应用数据，包括所有用户信息、云盘配置信息、用户上传的所有文件和照片。'
  const keepBoth = '选择该选项不会删除任何数据，但会在该目录下重建新的用户和云盘配置；该操作之后旧的用户上传的文件和照片在新系统中无法直接使用，用户只能手动迁移；旧系统中创建的文件、照片和相册分享无法恢复。'

  const tipStyle = {
    marginLeft: 48,
    marginTop: 8,
    width: 600,
    fontSize: 14,
    color: '#757575'
  }
  const tips = (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          marginLeft: '48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14
        }}
        onTouchTap={() => props.onTouchTap()}
      >
        <div style={{ width: 600 }}>
          {warning}
        </div>
        <div style={{ width: 48 }} />
        <div>
          {expandableHeight ? <UpIcon color={'#9e9e9e'} /> : <DownIcon color={'#9e9e9e'} />}
        </div>
      </div>
      <VerticalExpandable height={expandableHeight}>
        <div
          style={{
            marginLeft: '48',
            width: 600,
            fontSize: 14,
            color: '#757575'
          }}
        >
          {general}
        </div>
      </VerticalExpandable>
    </div>
  )

  const removeWisnucCheck = (
    <div style={{ marginBottom: 24 }}>
      <Checkbox
        checked={props.remove === 'wisnuc'}
        checkedIcon={<ToggleRadioButtonChecked />}
        uncheckedIcon={<ToggleRadioButtonUnchecked />}
        label="删除并重建wisnuc目录"
        labelStyle={{ fontSize: 16, color: '#212121', marginLeft: 8 }}
        onCheck={() => props.onCheck('wisnuc')}
        disableTouchRipple
        disableFocusRipple
      />
      <div style={tipStyle}>{removeWisnuc}</div>
    </div>
  )
  const removeFruitmixCheck = (
    <div style={{ marginBottom: 24 }}>
      <Checkbox
        checked={props.remove === 'fruitmix'}
        checkedIcon={<ToggleRadioButtonChecked />}
        uncheckedIcon={<ToggleRadioButtonUnchecked />}
        label="保留wisnuc目录，删除和重建fruitmix目录"
        labelStyle={{ fontSize: 16, color: '#212121', marginLeft: 8 }}
        onCheck={() => props.onCheck('fruitmix')}
        disableTouchRipple
        disableFocusRipple
      />
      <div style={tipStyle}>{removeFruitmix}</div>
    </div>
  )
  const keepBothCheck = (
    <div>
      <Checkbox
        checked={props.remove === undefined}
        checkedIcon={<ToggleRadioButtonChecked />}
        uncheckedIcon={<ToggleRadioButtonUnchecked />}
        label="保留wisnuc和fruitmix目录，重建用户和云盘信息"
        labelStyle={{ fontSize: 16, color: '#212121', marginLeft: 8 }}
        onCheck={() => props.onCheck(undefined)}
        disableTouchRipple
        disableFocusRipple
      />
      <div style={tipStyle}>{keepBoth}</div>
    </div>
  )
  let mustDelete = ''
  if (wisnuc.error === 'EWISNUCNOTDIR') { mustDelete = 'wisnuc' } else if (wisnuc.error === 'EFRUITMIXNOTDIR') { mustDelete = 'fruitmix' }
  return (
    <div>
      { warning && tips }
      { <div style={{}}>{removeWisnucCheck}</div>}
      { !(mustDelete === 'wisnuc') && <div style={{}}>{removeFruitmixCheck}</div> }
      { !mustDelete && <div style={{}}>{keepBothCheck}</div>}
    </div>
  )
}

const TextBox = props => (
  <div>
    { props.text.map((line, index) => <div key={index.toString()}>{line}</div>) }
  </div>
)

// onRequestClose
// onStart
export default class InitVolumeDialogs extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      stage: props.volume ? 'CONFIRM' : undefined,
      remove: undefined,
      user: null,
      err: null,
      res: null,
      expanded: false
    }

    this.cancelButton = <FlatButton label="取消" primary onTouchTap={this.props.onRequestClose} />

    this.toggleExpanded = () => {
      const newstatus = !this.state.expanded
      this.setState({ expanded: newstatus })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.volume === undefined && nextProps.volume !== undefined) {
      const wisnuc = nextProps.volume.wisnuc
      this.setState({
        // wisnuc directory is not exist when intact is true
        stage: wisnuc.intact ? 'SETUSER' : 'CONFIRM',
        remove: undefined,
        user: null,
        err: null,
        body: null
      })
    } else if (this.props.volume !== undefined && nextProps.volume === undefined) {
      this.setState({
        stage: undefined,
        remove: undefined,
        user: null,
        err: null,
        body: null
      })
    }
  }

  getActions() {
    switch (this.state.stage) {
      case 'CONFIRM':
        return [
          this.cancelButton,
          <FlatButton
            label="下一步"
            primary
            onTouchTap={() => this.setState({ stage: 'SETUSER' })}
          />
        ]

      case 'SETUSER':
        return [
          this.cancelButton,
          <FlatButton
            label="创建"
            primary
            onTouchTap={() => {
              this.setState({ stage: 'WIP' })

              const opts = {
                target: this.props.volume.fileSystemUUID,
                remove: this.state.remove,
                username: this.state.user.username,
                password: this.state.user.password
              }

              const device = window.store.getState().maintenance.device
              const url = `http://${device.address}:3000/system/mir/init`

              request
              .post(url)
              .set('Accept', 'application/json')
              .send(opts)
              .end((err, res) => {
                setTimeout(
                  () => this.setState({
                    stage: err ? 'FAILED' : 'SUCCESS',
                    err,
                    body: res && res.body
                  }), 2000)
                this.props.onResponse(err, res)
              })
            }}

            disabled={!this.state.user}
          />
        ]

      case 'WIP':
        return [<FlatButton label=" " disabled />]

      case 'SUCCESS':
        return [<FlatButton
          label="确定"
          primary onTouchTap={this.props.onRequestClose}
        />]

      case 'FAILED':
        return [<FlatButton
          label="确定"
          primary onTouchTap={this.props.onRequestClose}
        />]
    }
    return <div />
  }

  getTitle() {
    switch (this.state.stage) {
      case 'CONFIRM':
        return '确认操作'
      case 'SETUSER':
        return '设置用户名密码'
      case 'WIP':
        return '执行操作'
      case 'SUCCESS':
        return '操作成功'
      case 'FAILED':
        return '操作失败'
      default:
        return ''
    }
  }

  render() {
    const busyContentStyle = {
      width: '100%',
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }

    return (
      <Dialog
        contentStyle={{
          width: this.state.stage === 'CONFIRM' ? 744 : 336,
          height: 616
        }}
        title={this.getTitle()}
        open={this.state.stage !== undefined}
        model
        actions={this.getActions()}
      >
        <div style={{ width: '100%', height: '100%' }}>
          { this.state.stage === 'CONFIRM' ?
            <ReinitVolumeConfirm
              volume={this.props.volume}
              remove={this.state.remove}
              onCheck={remove => this.setState({ remove })}
              onTouchTap={() => this.setState({ expanded: !this.state.expanded })}
              expanded={this.state.expanded}
            /> :
          this.state.stage === 'SETUSER' ? <UsernamePassword onChange={user => this.setState({ user })} /> :
          this.state.stage === 'WIP' ? <div style={busyContentStyle}><CircularProgress /></div> :
          this.state.stage === 'SUCCESS' ? <TextBox text={[this.state.body.message]} /> :
          this.state.stage === 'FAILED' ? <TextBox text={[this.state.err.message]} /> : null }
        </div>
      </Dialog>
    )
  }
}

