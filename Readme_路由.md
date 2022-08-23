1. 简介
实现了页面曝光、离开 事件的监听通知，包括RN路由跳转、RN页面与Native页面跳转、App状态切换(切换到多任务界面，切换到后台，锁屏等) 场景下的页面曝光/离开事件。支持路由页面懒加载的使用方式，支持单RN页面项目。提供了class组件和hooks两种使用方式。集成ubtSource资源位追踪功能，无需任何设置，可通过开关设置去关闭，默认是打开状态。

2. 安装
npm install @xmly/react-native-page-analytics

3. 使用方式一：class组件

    3.1. 使用方式
a. 页面继承PageAnalytics.Screen 或者 PageAnalytics.PureScreen，分别对应普通组件和纯组件。
b. 定义组件的 customPageView 和 customPageExit 属性，类型是函数，分别在 页面展示 和 页面隐藏 时执行。
c. 对于 需要等到网络请求后再去发送首次页面展示埋点 的场景，可设置组件的needNotifyFirstPageView属性为true，然后在合适的时机调用this.notifyFirstPageView 去通知页面发送展示埋点。
d. 在componentWillUnmount中添加 super.componentWillUnmount(); 移除页面事件监听。

    3.2. 属性与方法
    3.2.1. 属性
属性名
类型
是否可选
含义
customPageView
() => void
否
页面展示埋点方法，需要去实现
customPageExit
() => void
否
页面离开埋点方法，需要去实现
needNotifyFirstPageView
boolean
是
是否 需要等到用户通知后再去执行页面展示埋点，默认为false
onlyUsePageAnalytic
boolean
是
是否 仅使用页面曝光功能，传true后将关闭ubtSource资源位追踪功能，默认为false，即默认打开资源位追踪功能

    3.2.2. 方法
方法名
类型
含义
notifyFirstPageView
() => void
通知页面去执行页面展示埋点方法



    3.3. 示例
    3.3.1. 首次页面展示埋点数据不依赖于网络请求/异步任务，进入页面立即发送
import PageAnalytics, { AnalyticProps } from '@xmly/react-native-page-analytics';

interface CurrentProps {}
interface CurrentState {}

class HomePage extends PageAnalytics.Screen<CurrentProps & AnalyticProps, CurrentState> {

  constructor(props: CurrentProps & AnalyticProps) {
    super(props);
  }
  
  componentWillUnmount() {
    // 移除监听
    super.componentWillUnmount();
  }

  // 页面展示事件埋点(必须实现此属性)
  customPageView = () => {
    xmlog.pageView(10000, 'homepage');
    console.log(`发送页面pageView埋点 页面名: homePage  metaId: 0`);
  };

  // 页面隐藏事件埋点(必须实现此属性)
  customPageExit = () => {
    xmlog.pageExit(10001, 'homepage');
    console.log(`发送页面pageExit埋点 页面名: homePage metaId: 0`);
  };

  render() {
    return <View />
  }
}


    3.3.2. 需要等到网络请求完成之后再去发送首次页面展示埋点
import PageAnalytics, { AnalyticProps } from '@xmly/react-native-page-analytics';

interface CurrentProps {}
interface CurrentState {
  id: number | null;
}

class HomePage extends PageAnalytics.Screen<CurrentProps & AnalyticProps, CurrentState> {

  constructor(props: CurrentProps & AnalyticProps) {
    super(props);
  }
  
  state: CurrentState = {
    id: null
  };
  
  componentDidMount() {
    this.fetchData();
  }    
    
  // 如果页面的首次展示埋点需要等到用户通知后 再去调用，设置此属性
  needNotifyFirstPageView = true;
  
  // 页面展示事件埋点(必须实现此属性)
  customPageView = () => {
    xmlog.pageView(10000, 'homepage', { id: this.state.id.toString() });
    console.log(`发送页面pageView埋点 页面名: homePage  id: ${this.state.id}`);
  };

  // 页面隐藏事件埋点(必须实现此属性)
  customPageExit = () => {
    xmlog.pageExit(10001, 'homepage');
    console.log(`发送页面pageExit埋点 页面名: homePage metaId: 0`);
  };
  
  // 请求数据
  fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    this.setState({ id: 100 });
    // 数据更新完毕后，通知页面去发送展示埋点
    this.notifyFirstPageView();
  };
  
  componentWillUnmount() {
    // 移除监听
    super.componentWillUnmount();
  }

  render() {
    return <View />
  }
}

    3.4. 注意事项
a. 须在 componentWillUnmount 中调用super.componentWillUnmount()去移除页面事件监听。
b. 对于页面埋点需要发送的参数都是固定不变的场景，可以不设置needNotifyFirstPageView属性，这样进入页面后会立即执行页面展示埋点方法；对于进入页面后需要发送首次请求，等数据返回后再去发送展示埋点的场景，可以设置needNotifyFirstPageView为true，需要在埋点数据准备好后手动去调用notifyFirstPageView方法，再此方法调用前，都不会去发送页面展示埋点，在needNotifyFirstPageView未设置或者设置为false时，notifyFirstPageView方法无效。


4. 使用方式二：函数组件(hooks)

    4.1. 使用方式
组件中使用 useScreen(param)，传入 customPageView，customPageExit，两个必传参数属性，分别在 页面展示 和 页面隐藏 时执行；needNotifyFirstPageView(可选)用来设置 页面的首次展示埋点 是否需要等到用户通知后才去执行； 对于使用了路由的页面，需要传入当前的路由对象navigation；对于使用了react-navigation-lazy-screen库的懒加载路由页面，需要传入 addFocusListener 与 addBlurListener 两个监听函数。

    4.2. API
方法
参数
返回值
useScreen()
{
    // 页面展示事件埋点
    customPageView?: () => void;

    // 页面隐藏事件埋点
    customPageExit?: () => void;

    //  是否需要等待用户通知后，再去首次发送页面展示埋点
    //  适用于首次页面展示埋点需要等到异步请求后的场景
    //  默认值为 false，即进入页面后立即发送展示埋点
     needNotifyFirstPageView?: boolean;

    //  是否仅使用曝光埋点，关闭ubtSource资源位功能
    //  默认值为false，即打开ubtSource资源位追踪功能
    onlyUsePageAnalytic?: boolean;

    // 若使用了路由，传入当前路由对象
    navigation?: NavigationProp<ParamListBase>;

    // 若使用了react-navigation-lazy-screen,传入addFocusListener 与 addBlurListener
    [index: string]: any;
}
 
{ 
     //  用于通知页面发送首次页面展示埋点
     //  只有在needNotifyFirstPageView为true时才生效
     notifyFirstPageView: () => void;
}

    4.3. 示例
    4.3.1. 首次页面展示埋点数据不依赖于网络请求/异步任务，进入页面立即发送
import PageAnalytics, { AnalyticProps } from '@xmly/react-native-page-analytics';

interface HomePageProps {}

export default function HomePage(props: HomePageProps & AnalyticProps) {

  // 页面展示事件埋点
  const customPageView = useCallback(() => {
    xmlog.pageView(10000, 'homepage');
    console.log(`发送页面pageView埋点 页面名: homePage  metaId: 0`);
  }, []);


  // 页面隐藏事件埋点
  const customPageExit = useCallback(() => {
    xmlog.pageExit(10001, 'homepage');
    console.log(`发送页面pageExit埋点 页面名: homePage metaId: 0`);
  }, []);

  PageAnalytics.useScreen({
    customPageView,
    customPageExit,
    
    // 对于有使用路由的页面，需要将路由对象navigation传入
    // 如果页面使用了react-navigation-lazy-screen, 传入addFocusListener 与 addBlurListener
    ...props, 
  });

  return <View />
}


    4.3.2. 需要等到网络请求完成之后再去发送首次页面展示埋点
import PageAnalytics, { AnalyticProps } from '@xmly/react-native-page-analytics';

interface HomePageProps {}

export default function HomePage(props: HomePageProps & AnalyticProps) {
    
  let [id, setId] = useState<number | null>(null);
  
  // 页面展示事件埋点
  const customPageView = useCallback(() => {
    xmlog.pageView(10000, 'homepage', { id: id.toString() });
    console.log(`发送页面pageView埋点 页面名: homePage, id: ${id}`);
  }, []);


  // 页面隐藏事件埋点
  const customPageExit = useCallback(() => {
    xmlog.pageExit(10001, 'homepage');
    console.log(`发送页面pageExit埋点 页面名: homePage metaId: 0`);
  }, []);

  let { notifyFirstPageView } = PageAnalytics.useScreen({
    customPageView,
    customPageExit,
    // 设置是否等到用户通知后再去执行页面展示埋点方法
    needNotifyFirstPageView: true,
    // 对于有使用路由的页面，需要将路由对象navigation传入
    // 如果页面使用了react-navigation-lazy-screen, 传入addFocusListener 与 addBlurListener
    ...props, 
  });
    
  // 模拟等待一个网络请求后再去发送页面展示埋点，请求结束后通知页面去发送
  let fetchData = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setId(100);  
    notifyFirstPageView();
  }, []);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return <View />
}

    4.4. 注意事项
a. 对于使用了路由的页面，需要将路由对象navigation传入；通常情况下，路由页面的props里面就已经有navigation属性，可以将页面的props全部传入，useScreen中会去解析其中的navigation属性。
b. 对于使用了路由页面懒加载库 react-navigation-lazy-screen的页面，这个库对navigation的 focus 和 blur 事件进行了封装，使用了这个库的页面都会收到addFocusListener和 addBlurListener两个prop，需要将这两个prop传入useScreen，可以将页面的props全部传入，useScreen中会去解析这两个属性。
c. 对于页面埋点需要发送的参数都是固定不变的场景，可以不设置needNotifyFirstPageView参数，这样进入页面后会立即执行页面展示埋点方法；对于进入页面后需要发送首次请求，等数据返回后再去发送展示埋点的场景，可以设置needNotifyFirstPageView为true，需要在埋点数据准备好后手动去调用notifyFirstPageView方法，再此方法调用前，都不会去发送页面展示埋点，在needNotifyFirstPageView未设置或者设置为false时，notifyFirstPageView方法无效。
