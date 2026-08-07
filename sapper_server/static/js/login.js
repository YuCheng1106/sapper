// 当点击注册的时候
$('#signup').click(function() {
    // 平移粉色的盒子，显示注册页面
    $('.pinkbox').css('transform', 'translateX(80%)');
    // 隐藏登录表单
    $('.signin').addClass('nodisplay');
    // 显示注册表单
    $('.signup').removeClass('nodisplay');
});


// 当点击登录的时候
$('#signin').click(function() {
    // 平移粉色的盒子，显示注册页面
    $('.pinkbox').css('transform', 'translateX(0%)');
     // 隐藏注册表单
     $('.signup').addClass('nodisplay');
    // 显示登录表单
    $('.signin').removeClass('nodisplay');
   
});