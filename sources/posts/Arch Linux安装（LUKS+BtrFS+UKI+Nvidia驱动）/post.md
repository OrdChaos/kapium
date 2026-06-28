最近内存涨价涨的疯狂，连带着笔记本价格也水涨船高。再买新的肯定不值得，但我目前正在使用的电脑又太沉不方便携带，于是把目光投眼于我爸的老电脑上。

跑Windows11肯定是算了，虽然电脑还算是现代，但我没必要忍受卡顿，于是Linux自然成了首选。

至于为什么是Arch，因为我离不开Aur.

## 电脑配置

电脑是HP Envy 13-ad1xx，是2017年的电脑（哇距离2017年都快10年了），配置如下：

- CPU: Intel I7-8550U
- GPU: Intel Graphic 620 / Nvidia MX150
- RAM: 8GB DDR3
- SSD: KingSton SA2000M8500G

看到`Nvidia`就感觉麻烦了，哎。<span class="heimu" title="你知道的太多了">FUCK YOU, NVIDIA!</span>

## 关于网络问题

可以使一台Windows系统的，连接网线的，拥有无线网卡的，运行着TUN模式代理的设备充当软路由。

首先，以管理员模式启动代理软件，开启TUN模式。

之后，在设置中开启电脑热点。

接着，使用快捷键`Win+R`，输入`ncpa.cpl`打开网卡列表：

![](https://base.pics.ordchaos.com/2026/06/90dff629f26a10efba5671fa6c44d100.png)

双击打开TUN模式的网卡属性，按如下流程操作：

![](https://base.pics.ordchaos.com/2026/06/4747666a93bec555f7184d13bcddb38a.png)

其它设备在连接网络时选择热点即可。

可在其它设备上使用：

```shell
curl -I www.google.com
```

检验是否成功，若返回200即为成功。

## 安装Arch Linux

### 进入Live CD环境

先下载镜像。镜像可以在镜像源下载，[这里](https://archlinux.org/download/)查看。

如选择[阿里云](https://mirrors.aliyun.com/archlinux/iso/2026.06.01/)[^1]，如下图所示，选择`archlinux-2026.06.01-x86_64.iso`下载：

![](https://base.pics.ordchaos.com/2026/06/6c1cfc40b10cd29a420a26d68a5f5a07.png)

接着烧录启动盘，我习惯用`Rufus`，不过也有人用`Ventory`，这个随意。

进入需要安装的电脑的BIOS，关闭安全启动，同时

上电启动（记得进BIOS关掉安全启动）。

启动完成后大致如图所示：

![](https://base.pics.ordchaos.com/2026/06/d7712b456d31cbabde319f0ea4f02e62.jpg)

### 连接网络

接了网线应该直接就能用。连接到无线局域网参考以下步骤。

使用`iwctl`工具，在shell中输入以下内容：

```shell
iwctl                                       # 进入 iwctl 命令行
[iwd]# device list                          # 显示所有 Wifi 设备
[iwd]# station <适配器名称> scan             # 扫描网络（不会有输出）
[iwd]# station <适配器名称> get-networks     # 显示所有扫描到的网络
[iwd]# station <适配器名称> connect <SSID>   # 连接网络
[iwd]# exit                                 # 退出
```

可尝试`ping baidu.com`查看是否连接到互联网。

### ssh连接

安装过程中会有很多地方需要输入命令，手输肯定不方便，能用ssh的话就能复制粘贴了

在已经启动Live CD的电脑上，使用`ip addr`查看ip地址。

如下图，注意选择正确的无线网络适配器下的内网ip（这里是`wlan0`下的`192.168.1.243`）：

![](https://base.pics.ordchaos.com/2026/06/4432bd9c721823b7a3da06800103bfec.jpg)

然后，使用`passwd`设置root密码。

在连接到同一局域网的电脑中，使用`ssh root@<获取到的ip地址>`进行ssh连接。

如图为连接成功：

![](https://base.pics.ordchaos.com/2026/06/9d7be47f0279d8f6e9a0b0b4a52d7ffe.png)

### 切换镜像

编辑`/etc/pacman.d/mirrorlist`：

```shell
mv /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.bak
nano /etc/pacman.d/mirrorlist
```

注意这里的mirrorlist会被复制到安装好的系统里面，需要仔细斟酌。

官方镜像列表在[这里](https://archlinux.org/mirrorlist/)

最后我配出来是这样：

```miirrorlist
# HTTPS

# University of Science and Technology of China
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch

# Tsinghua University
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch

# Aliyun
Server = https://mirrors.aliyun.com/archlinux/$repo/os/$arch

# HTTP

# University of Science and Technology of China
Server = http://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch

# Tsinghua University
Server = http://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch

# Aliyun
Server = http://mirrors.aliyun.com/archlinux/$repo/os/$arch
```

接着`pacman -Syy`更新。

### 磁盘分区

我习惯cfdisk，别的也行，但这个我顺手。

因为有UKI的需求，把boot分区分得大一些。

最后分区表如下：

```shell
lsblk /dev/nvme0n1

NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
nvme0n1     259:0    0 465.8G  0 disk
├─nvme0n1p1 259:3    0     1G  0 part
└─nvme0n1p2 259:4    0 464.8G  0 part
```

接着创建LUKS加密卷与BtrFS子卷。

对刚分出的大分区加密：

```shell
cryptsetup luksFormat /dev/nvme0n1p2
```

记住硬盘密码就好。

注意`Are you sure? (Type 'yes' in capital letters):`，输入`YES`，全大写（**capital letters**）。

接下来将加密分区解密，并映射为一个名为 cryptroot 的虚拟设备：

```shell
cryptsetup open /dev/nvme0n1p2 cryptroot
```

解密后的设备路径是`/dev/mapper/cryptroot`，向这个加密通道内部写入`BtrFS`文件系统：

```shell
mkfs.btrfs /dev/mapper/cryptroot
```

接下来挂载它，并创建需要的子卷就好，我这里是这样：

```shell
# 压缩算法随意选择
mount --mkdir /dev/mapper/cryptroot -o compress=zstd /tmp/btrfs-full

# 暂时挂载到 /mnt 
mount /dev/mapper/cryptroot /mnt

# 创建标准子卷
btrfs subvolume create /tmp/btrfs-full/@
btrfs subvolume create /tmp/btrfs-full/@home
btrfs subvolume create /tmp/btrfs-full/@var-log
btrfs subvolume create /tmp/btrfs-full/@var-cache
btrfs subvolume create /tmp/btrfs-full/@var-tmp
btrfs subvolume create /tmp/btrfs-full/@swap

# 为部分不需要写时复制的子卷设置相关属性
chattr +C /tmp/btrfs-full/@swap
chattr +C /tmp/btrfs-full/@var-cache
chattr +C /tmp/btrfs-full/@var-log

# 卸载，为了之后按照最终布局重新挂载
umount /tmp/btrfs-full
```

然后挂载子卷：

```shell
# 注意这里的 compress 和上面选择的压缩算法一致
mount --mkdir /dev/mapper/cryptroot -o compress=zstd,space_cache=v2,noatime,subvol=@ /mnt
mount --mkdir /dev/mapper/cryptroot -o compress=zstd,space_cache=v2,noatime,subvol=@home /mnt/home
mount --mkdir /dev/mapper/cryptroot -o compress=zstd,space_cache=v2,noatime,subvol=@var-log /mnt/var/log
mount --mkdir /dev/mapper/cryptroot -o compress=zstd,space_cache=v2,noatime,subvol=@var-cache /mnt/var/cache
mount --mkdir /dev/mapper/cryptroot -o compress=zstd,space_cache=v2,noatime,subvol=@var-tmp /mnt/var/tmp
mount --mkdir /dev/mapper/cryptroot -o noatime,subvol=@swap /mnt/swap

# 创建 swapfile 并启用
btrfs fi mkswapfile /mnt/swap/swapfile --uuid clear --size 16G
swapon /mnt/swap/swapfile

# 格式化并挂载 EFI 分区
mkfs.vfat -F 32 /dev/nvme0n1p1
mount --mkdir /dev/nvme0n1p1 /mnt/boot
```

### 安装软件包

使用`pacstrap`安装必须的软件包，我这里是这些：

```shell
pacstrap -K /mnt base base-devel linux linux-firmware btrfs-progs intel-ucode networkmanager nano neovim man-pages man-db texinfo sbctl openssh
```

### 写入磁盘分区配置

使用`genfstab`进行生成即可：

```shell
genfstab -U /mnt > /mnt/etc/fstab
```

### 进入chroot环境

如下：

```shell
arch-chroot /mnt
```

### 时间同步

设置时间和时区：

```shell
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

启用ntp（这里用`systemd-timesyncd`）

先进行配置，编辑`/etc/systemd/timesyncd.conf`：

取消`NTP`和`FallbackNTP`的注释，并配置`NTP`为喜欢的ntp服务，用空格区分（我这里是`0.cn.pool.ntp.org 1.cn.pool.ntp.org 2.cn.pool.ntp.org 3.cn.pool.ntp.org`）

接着：

```shell
systemctl enable --now systemd-timesyncd.service
timedatectl set-ntp true
```

验证：

```shell
date
```

应当输出本地时间。

最后生成`/etc/adjtime`：

```shell
hwclock --systohc
```

### 区域和本地化设置

编辑`/etc/locale.gen`，取消需要地区的注释。于我而言，取消`en_US.UTF-8 UTF-8``en_SG.UTF-8 UTF-8``zh_CN.UTF-8 UTF-8`三行。

然后执行`locale-gen`以生成locale信息。

创建`/etc/locale.conf`文件，并编辑设定`LANG`变量：

```conf
LANG=en_SG.UTF-8
```

使用`en_SG`以避免英式单位。

创建`/etc/vconsole.conf`确定键盘布局：

```conf
KEYMAP=us
```

### 网络配置

设置主机名即可。

编辑`/etc/hostname`：

```hostname
<主机名>
```

### 创建initramfs

编辑`/etc/mkinitcpio.conf`，在`HOOKS=(...)`这一行的括号里的`filesystem`前添加`sd-encrypt`

重新生成内核镜像：

```shell
mkinitcpio -P
```

### 配置启动引导程序与UKI

这里用`systemd-boot`，使用以下命令来安装：

```shell
bootctl install
```

忽略警告，我们会在一会后解决这个问题。

获取加密主分区的UUID：

```shell
blkid -s UUID -o value /dev/nvme0n1p2
```

创建并编辑`/etc/kernel/cmdline`：

```cmdline
rd.luks.name=<你的LUKS分区UUID>=cryptroot root=/dev/mapper/cryptroot rootflags=subvol=@ rw quiet
```

编辑`/etc/mkinitcpio.d/linux.preset`，改成这样：

```present
ALL_config="/etc/mkinitcpio.conf"
ALL_kver="/boot/vmlinuz-linux"
#ALL_kerneldest="/boot/vmlinuz-linux"

#PRESETS=('default')
PRESETS=('default' 'fallback')

default_config="/etc/mkinitcpio.conf"
#default_image="/boot/initramfs-linux.img"
default_uki="/boot/EFI/Linux/arch-linux.efi"
#default_options="--splash /usr/share/systemd/bootctl/splash-arch.bmp"

fallback_config="/etc/mkinitcpio.conf"
#fallback_image="/boot/initramfs-linux-fallback.img"
fallback_uki="/boot/EFI/Linux/arch-linux-fallback.efi"
#fallback_options="-S autodetect"
```

创建对应的存放目录：

```shell
mkdir -p /boot/EFI/Linux
```

检查当前安全启动状态：

```shell
sbctl status

Installed:      ✗ sbctl is not installed
Setup Mode:     ✗ Enabled
Secure Boot:    ✗ Disabled
Vendor Keys:    none
```

若在开始安装前清除了安全启动金钥，则`Setup Mode`应为`Enabled`。若不为，则重启至BIOS清除金钥后再返回Live CD环境中，重新解密、挂载磁盘后进入chroot环境。

接着生成自定义加密密钥、将密钥注册到主板BIOS中：

```shell
sbctl create-keys
sbctl enroll-keys -m
```

再次查看status，发现应如下：

```shell
Installed:      ✓ sbctl is installed
Owner GUID:     d6f24875-6a21-4500-aed4-9c7b211fe340
Setup Mode:     ✓ Disabled
Secure Boot:    ✗ Disabled
Vendor Keys:    microsoft
```

接着生成UKI文件：

```shell
mkinitcpio -P
```

签名`systemd-boot`自身的引导程序与`vmlinuz-linux`：

```shell
sbctl sign -s /boot/EFI/systemd/systemd-bootx64.efi
sbctl sign -s /boot/EFI/BOOT/BOOTX64.EFI
```

检查是否全部被签名：

```shell
sbctl verify

Verifying file database and EFI images in /boot...
✓ /boot/vmlinuz-linux is signed
✓ /boot/EFI/BOOT/BOOTX64.EFI is signed
✓ /boot/EFI/systemd/systemd-bootx64.efi is signed
✓ /boot/EFI/Linux/arch-linux-fallback.efi is signed
✓ /boot/EFI/Linux/arch-linux.efi is signed
```

全部被签名即为成功。

### 设置root密码、创建新用户

设置root密码：

```shell
passwd
```

创建新用户：

```shell
useradd -G wheel -m <用户名>
passwd <用户名>
```

设置`wheel`用户组权限：

```shell
export EDITOR=nano
visudo
```

删除`%wheel ALL=(ALL:ALL) ALL`前的注释符号。

### 进入真机环境

先退出chroot环境：

```shell
exit
```

然后卸载磁盘：

```shell
swapoff /mnt/swap/swapfile
umount -R /mnt
```

重启计算机至BIOS，打开安全启动。

重新启动后，设备应当会要求输入磁盘密码，输入后即可进入正常的tty界面。

### 配置TPM2

```shell
systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 /dev/nvme0n1p2
```

会要求输入磁盘密码，输入后`TPM2`即配置完成。

此后开机时应不再要求输入磁盘密码。

## 安装Nvidia驱动

### 连接网络

打开Network Manager：

```shell
systemctl enable --now NetworkManager
```

连接网络：

```shell
nmcli device wifi connect "<SSID>" password "<WIFI密码>"
```

还想使用ssh连接的话，打开sshd：

```shell
systemctl enable --now sshd
```

注意ssh默认不允许登入root账号，请登入刚刚设置的其他账号。

如果真机环境的局域网ip与Live CD下相同，可能由于`known_hosts`中保存的`ssh_key`与实际不一致而产生错误无法登入ssh，这时修改`~/.ssh/known_hosts`删掉即可。

### 添加32位库、ArchLinuxCN

编辑`/etc/pacman.conf`：

删除`multilib`配置前的注释符号，并在最底部添加：

```conf
[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
```

更新数据库并安装`archlinuxcn-keyring`：

```shell
pacman -Sy archlinuxcn-keyring
```

更新系统并安装镜像仓库列表；

```shell
pacman -Su archlinuxcn-mirrorlist-git
```

编辑`/etc/pacman.conf`，将刚刚添加的`Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch`替换为`Include = /etc/pacman.d/archlinuxcn-mirrorlist`。

编辑`/etc/pacman.d/archlinuxcn-mirrorlist`，去除任意数量的想要使用的站点前面的注释即可。

### 安装AUR助手

ArchLinuxCN源里面有`paru`，直接安装即可：

```shell
pacman -S paru
```

### 安装驱动

Intel这边相对省心一些：

```shell
sudo pacman -S mesa lib32-mesa vulkan-intel lib32-vulkan-intel
```

不要安装`xf86-video-intel`。

对于Nvidia显卡，先检查自己电脑显卡对应的驱动版本。对我而言，MX150是`Pascal`架构的显卡，已经被Nvidia停止支持，因此需要安装旧版本驱动。

同时，要安装让内核能与驱动通信的头。

如下：

```shell
paru -S nvidia-550xx-dkms nvidia-550xx-utils lib32-nvidia-550xx-utils linux-headers
```

编辑`/etc/mkinitcpio.conf`，找到`MODULES=(...)`行，把Intel和Nvidia的模块按顺序填进去：

```conf
MODULES=(i915 nvidia nvidia_modeset nvidia_uvm nvidia_drm)
```

找到`BINARIES=(...)`行，添加`setfont`

```conf
BINARIES=(setfont)
```

然后重新生成内核镜像：

```shell
mkinitcpio -P
```

重启电脑，使用`nvidia-smi`，应当得到类似输出：

```txt
Sun Jun 28 16:53:24 2026
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.163.01             Driver Version: 550.163.01     CUDA Version: 12.4     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce MX150           Off |   00000000:01:00.0 Off |                  N/A |
| N/A   48C    P0             N/A / ERR!  |       0MiB /   2048MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI        PID   Type   Process name                              GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
```

### 省电相关

MX150是Pascal架构的显卡，不支持RTD3，显卡待机时不能完全断电，不过仍然能通过PRIME减少耗电。

开启Nvidia电源管理服务：

```shell
systemctl enable --now nvidia-suspend.service
systemctl enable --now nvidia-hibernate.service
systemctl enable --now nvidia-resume.service
```

编辑Nvidia模块配置文件`/etc/modprobe.d/nvidia.conf`：

```shell
options nvidia_drm modeset=1
options nvidia "NVreg_DynamicPowerManagement=0x01"
```

安装`prime-run`：

```shell
pacman -S prime-run
```

重新生成内核镜像：

```shell
mkinitcpio -P
```

重启电脑，搞定。

## 题外话

没有题外话。

我要累死了。

886

[^1]: 该链接为本文撰写日期（2026.06.28）的最新镜像，时效性强，切忌盲目使用